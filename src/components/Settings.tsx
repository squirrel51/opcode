import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle,
  Loader2,
  Shield,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  api, 
  type ClaudeSettings,
  type ClaudeInstallation
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { Toast, ToastContainer } from "@/components/ui/toast";
import { ClaudeVersionSelector } from "./ClaudeVersionSelector";
import { StorageTab } from "./StorageTab";
import { HooksEditor } from "./HooksEditor";
import { SlashCommandsManager } from "./SlashCommandsManager";
import { ProxySettings } from "./ProxySettings";
import { useTheme, useTrackEvent } from "@/hooks";
import { analytics } from "@/lib/analytics";
import { useTranslation } from "react-i18next";
import { TabPersistenceService } from "@/services/tabPersistence";

interface SettingsProps {
  /**
   * Callback to go back to the main view
   */
  onBack: () => void;
  /**
   * Optional className for styling
   */
  className?: string;
}

interface PermissionRule {
  id: string;
  value: string;
}

interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
}

/**
 * Comprehensive Settings UI for managing Claude Code settings
 * Provides a no-code interface for editing the settings.json file
 */
export const Settings: React.FC<SettingsProps> = ({
  className,
}) => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<ClaudeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [currentBinaryPath, setCurrentBinaryPath] = useState<string | null>(null);
  const [selectedInstallation, setSelectedInstallation] = useState<ClaudeInstallation | null>(null);
  const [binaryPathChanged, setBinaryPathChanged] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Permission rules state
  const [allowRules, setAllowRules] = useState<PermissionRule[]>([]);
  const [denyRules, setDenyRules] = useState<PermissionRule[]>([]);
  
  // Environment variables state
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([]);
  
  // Hooks state
  const [userHooksChanged, setUserHooksChanged] = useState(false);
  const getUserHooks = React.useRef<(() => any) | null>(null);
  
  // Theme hook
  const { theme, setTheme, customColors, setCustomColors } = useTheme();
  
  // Proxy state
  const [proxySettingsChanged, setProxySettingsChanged] = useState(false);
  const saveProxySettings = React.useRef<(() => Promise<void>) | null>(null);
  
  // Analytics state
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const trackEvent = useTrackEvent();
  
  // Tab persistence state
  const [tabPersistenceEnabled, setTabPersistenceEnabled] = useState(true);
  // Startup intro preference
  const [startupIntroEnabled, setStartupIntroEnabled] = useState(true);
  
  // Load settings on mount
  useEffect(() => {
    loadSettings();
    loadClaudeBinaryPath();
    loadAnalyticsSettings();
    // Load tab persistence setting
    setTabPersistenceEnabled(TabPersistenceService.isEnabled());
    // Load startup intro setting (default to true if not set)
    (async () => {
      const pref = await api.getSetting('startup_intro_enabled');
      setStartupIntroEnabled(pref === null ? true : pref === 'true');
    })();
  }, []);

  /**
   * Loads analytics settings
   */
  const loadAnalyticsSettings = async () => {
    const settings = analytics.getSettings();
    if (settings) {
      setAnalyticsEnabled(settings.enabled);
    }
  };

  /**
   * Loads the current Claude binary path
   */
  const loadClaudeBinaryPath = async () => {
    try {
      const path = await api.getClaudeBinaryPath();
      setCurrentBinaryPath(path);
    } catch (err) {
      console.error("Failed to load Claude binary path:", err);
    }
  };

  /**
   * Loads the current Claude settings
   */
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedSettings = await api.getClaudeSettings();
      
      // Ensure loadedSettings is an object
      if (!loadedSettings || typeof loadedSettings !== 'object') {
        console.warn("Loaded settings is not an object:", loadedSettings);
        setSettings({});
        return;
      }
      
      setSettings(loadedSettings);

      // Parse permissions
      if (loadedSettings.permissions && typeof loadedSettings.permissions === 'object') {
        if (Array.isArray(loadedSettings.permissions.allow)) {
          setAllowRules(
            loadedSettings.permissions.allow.map((rule: string, index: number) => ({
              id: `allow-${index}`,
              value: rule,
            }))
          );
        }
        if (Array.isArray(loadedSettings.permissions.deny)) {
          setDenyRules(
            loadedSettings.permissions.deny.map((rule: string, index: number) => ({
              id: `deny-${index}`,
              value: rule,
            }))
          );
        }
      }

      // Parse environment variables
      if (loadedSettings.env && typeof loadedSettings.env === 'object' && !Array.isArray(loadedSettings.env)) {
        setEnvVars(
          Object.entries(loadedSettings.env).map(([key, value], index) => ({
            id: `env-${index}`,
            key,
            value: value as string,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      setError("Failed to load settings. Please ensure ~/.claude directory exists.");
      setSettings({});
    } finally {
      setLoading(false);
    }
  };

  /**
   * Saves the current settings
   */
  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setToast(null);

      // Build the settings object
      const updatedSettings: ClaudeSettings = {
        ...settings,
        permissions: {
          allow: allowRules.map(rule => rule.value).filter(v => v && String(v).trim()),
          deny: denyRules.map(rule => rule.value).filter(v => v && String(v).trim()),
        },
        env: envVars.reduce((acc, { key, value }) => {
          if (key && String(key).trim() && value && String(value).trim()) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>),
      };

      await api.saveClaudeSettings(updatedSettings);
      setSettings(updatedSettings);

      // Save Claude binary path if changed
      if (binaryPathChanged && selectedInstallation) {
        await api.setClaudeBinaryPath(selectedInstallation.path);
        setCurrentBinaryPath(selectedInstallation.path);
        setBinaryPathChanged(false);
      }

      // Save user hooks if changed
      if (userHooksChanged && getUserHooks.current) {
        const hooks = getUserHooks.current();
        await api.updateHooksConfig('user', hooks);
        setUserHooksChanged(false);
      }

      // Save proxy settings if changed
      if (proxySettingsChanged && saveProxySettings.current) {
        await saveProxySettings.current();
        setProxySettingsChanged(false);
      }

      setToast({ message: t('settings.toasts.saveSuccess'), type: "success" });
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError(t('settings.errors.saveFailed'));
      setToast({ message: t('settings.toasts.saveFailed'), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Updates a simple setting value
   */
  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Adds a new permission rule
   */
  const addPermissionRule = (type: "allow" | "deny") => {
    const newRule: PermissionRule = {
      id: `${type}-${Date.now()}`,
      value: "",
    };
    
    if (type === "allow") {
      setAllowRules(prev => [...prev, newRule]);
    } else {
      setDenyRules(prev => [...prev, newRule]);
    }
  };

  /**
   * Updates a permission rule
   */
  const updatePermissionRule = (type: "allow" | "deny", id: string, value: string) => {
    if (type === "allow") {
      setAllowRules(prev => prev.map(rule => 
        rule.id === id ? { ...rule, value } : rule
      ));
    } else {
      setDenyRules(prev => prev.map(rule => 
        rule.id === id ? { ...rule, value } : rule
      ));
    }
  };

  /**
   * Removes a permission rule
   */
  const removePermissionRule = (type: "allow" | "deny", id: string) => {
    if (type === "allow") {
      setAllowRules(prev => prev.filter(rule => rule.id !== id));
    } else {
      setDenyRules(prev => prev.filter(rule => rule.id !== id));
    }
  };

  /**
   * Adds a new environment variable
   */
  const addEnvVar = () => {
    const newVar: EnvironmentVariable = {
      id: `env-${Date.now()}`,
      key: "",
      value: "",
    };
    setEnvVars(prev => [...prev, newVar]);
  };

  /**
   * Updates an environment variable
   */
  const updateEnvVar = (id: string, field: "key" | "value", value: string) => {
    setEnvVars(prev => prev.map(envVar => 
      envVar.id === id ? { ...envVar, [field]: value } : envVar
    ));
  };

  /**
   * Removes an environment variable
   */
  const removeEnvVar = (id: string) => {
    setEnvVars(prev => prev.filter(envVar => envVar.id !== id));
  };

  /**
   * Handle Claude installation selection
   */
  const handleClaudeInstallationSelect = (installation: ClaudeInstallation) => {
    setSelectedInstallation(installation);
    setBinaryPathChanged(installation.path !== currentBinaryPath);
  };

  return (
    <div className={cn("h-full overflow-y-auto", className)}>
      <div className="max-w-6xl mx-auto flex flex-col h-full">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-1">{t('settings.title')}</h1>
              <p className="mt-1 text-body-small text-muted-foreground">
                {t('settings.description')}
              </p>
            </div>
            <motion.div
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                onClick={saveSettings}
                disabled={saving || loading}
                size="default"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t('settings.saveButton')}
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="mx-4 mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/50 flex items-center gap-2 text-body-small text-destructive"
          >
            <AlertCircle className="h-4 w-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-8 w-full mb-6 h-auto p-1">
              <TabsTrigger value="general" className="py-2.5 px-3">{t('settings.tabs.general')}</TabsTrigger>
              <TabsTrigger value="permissions" className="py-2.5 px-3">{t('settings.tabs.permissions')}</TabsTrigger>
              <TabsTrigger value="environment" className="py-2.5 px-3">{t('settings.tabs.environment')}</TabsTrigger>
              <TabsTrigger value="advanced" className="py-2.5 px-3">{t('settings.tabs.advanced')}</TabsTrigger>
              <TabsTrigger value="hooks" className="py-2.5 px-3">{t('settings.tabs.hooks')}</TabsTrigger>
              <TabsTrigger value="commands" className="py-2.5 px-3">{t('settings.tabs.commands')}</TabsTrigger>
              <TabsTrigger value="storage" className="py-2.5 px-3">{t('settings.tabs.storage')}</TabsTrigger>
              <TabsTrigger value="proxy" className="py-2.5 px-3">{t('settings.tabs.proxy')}</TabsTrigger>
            </TabsList>
            
            {/* General Settings */}
            <TabsContent value="general" className="space-y-6 mt-6">
              <Card className="p-6 space-y-6">
                <div>
                  <h3 className="text-heading-4 mb-4">{t('settings.general.title')}</h3>
                  
                  <div className="space-y-4">
                    {/* Theme Selector */}
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t('settings.general.theme.label')}</Label>
                        <p className="text-caption text-muted-foreground mt-1">
                          {t('settings.general.theme.description')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
                        <button
                          onClick={() => setTheme('dark')}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                            theme === 'dark' 
                              ? "bg-background shadow-sm" 
                              : "hover:bg-background/50"
                          )}
                        >
                          {theme === 'dark' && <Check className="h-3 w-3" />}
                          {t('settings.general.theme.dark')}
                        </button>
                        <button
                          onClick={() => setTheme('gray')}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                            theme === 'gray' 
                              ? "bg-background shadow-sm" 
                              : "hover:bg-background/50"
                          )}
                        >
                          {theme === 'gray' && <Check className="h-3 w-3" />}
                          {t('settings.general.theme.gray')}
                        </button>
                        <button
                          onClick={() => setTheme('light')}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                            theme === 'light' 
                              ? "bg-background shadow-sm" 
                              : "hover:bg-background/50"
                          )}
                        >
                          {theme === 'light' && <Check className="h-3 w-3" />}
                          {t('settings.general.theme.light')}
                        </button>
                        <button
                          onClick={() => setTheme('custom')}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                            theme === 'custom' 
                              ? "bg-background shadow-sm" 
                              : "hover:bg-background/50"
                          )}
                        >
                          {theme === 'custom' && <Check className="h-3 w-3" />}
                          {t('settings.general.theme.custom')}
                        </button>
                      </div>
                    </div>
                    
                    {/* Language Selector */}
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t('settings.general.language.label')}</Label>
                        <p className="text-caption text-muted-foreground mt-1">
                          {t('settings.general.language.description')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
                        <button
                          onClick={() => i18n.changeLanguage('en')}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                            i18n.language === 'en' 
                              ? "bg-background shadow-sm" 
                              : "hover:bg-background/50"
                          )}
                        >
                          {i18n.language === 'en' && <Check className="h-3 w-3" />}
                          {t('settings.general.language.english')}
                        </button>
                        <button
                          onClick={() => i18n.changeLanguage('zh')}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                            i18n.language === 'zh' 
                              ? "bg-background shadow-sm" 
                              : "hover:bg-background/50"
                          )}
                        >
                          {i18n.language === 'zh' && <Check className="h-3 w-3" />}
                          {t('settings.general.language.chinese')}
                        </button>
                      </div>
                    </div>
                    
                    {/* Custom Color Editor */}
                    {theme === 'custom' && (
                      <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                        <h4 className="text-label">{t('settings.general.customTheme.title')}</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {/* Background Color */}
                          <div className="space-y-2">
                            <Label htmlFor="color-background" className="text-caption">{t('settings.general.customTheme.background')}</Label>
                            <div className="flex gap-2">
                              <Input
                                id="color-background"
                                type="text"
                                value={customColors.background}
                                onChange={(e) => setCustomColors({ background: e.target.value })}
                                placeholder="oklch(0.12 0.01 240)"
                                className="font-mono text-xs"
                              />
                              <div 
                                className="w-10 h-10 rounded border"
                                style={{ backgroundColor: customColors.background }}
                              />
                            </div>
                          </div>
                          
                          {/* Foreground Color */}
                          <div className="space-y-2">
                            <Label htmlFor="color-foreground" className="text-caption">{t('settings.general.customTheme.foreground')}</Label>
                            <div className="flex gap-2">
                              <Input
                                id="color-foreground"
                                type="text"
                                value={customColors.foreground}
                                onChange={(e) => setCustomColors({ foreground: e.target.value })}
                                placeholder="oklch(0.98 0.01 240)"
                                className="font-mono text-xs"
                              />
                              <div 
                                className="w-10 h-10 rounded border"
                                style={{ backgroundColor: customColors.foreground }}
                              />
                            </div>
                          </div>
                          
                          {/* Primary Color */}
                          <div className="space-y-2">
                            <Label htmlFor="color-primary" className="text-caption">{t('settings.general.customTheme.primary')}</Label>
                            <div className="flex gap-2">
                              <Input
                                id="color-primary"
                                type="text"
                                value={customColors.primary}
                                onChange={(e) => setCustomColors({ primary: e.target.value })}
                                placeholder="oklch(0.98 0.01 240)"
                                className="font-mono text-xs"
                              />
                              <div 
                                className="w-10 h-10 rounded border"
                                style={{ backgroundColor: customColors.primary }}
                              />
                            </div>
                          </div>
                          
                          {/* Card Color */}
                          <div className="space-y-2">
                            <Label htmlFor="color-card" className="text-caption">{t('settings.general.customTheme.card')}</Label>
                            <div className="flex gap-2">
                              <Input
                                id="color-card"
                                type="text"
                                value={customColors.card}
                                onChange={(e) => setCustomColors({ card: e.target.value })}
                                placeholder="oklch(0.14 0.01 240)"
                                className="font-mono text-xs"
                              />
                              <div 
                                className="w-10 h-10 rounded border"
                                style={{ backgroundColor: customColors.card }}
                              />
                            </div>
                          </div>
                          
                          {/* Accent Color */}
                          <div className="space-y-2">
                            <Label htmlFor="color-accent" className="text-caption">{t('settings.general.customTheme.accent')}</Label>
                            <div className="flex gap-2">
                              <Input
                                id="color-accent"
                                type="text"
                                value={customColors.accent}
                                onChange={(e) => setCustomColors({ accent: e.target.value })}
                                placeholder="oklch(0.16 0.01 240)"
                                className="font-mono text-xs"
                              />
                              <div 
                                className="w-10 h-10 rounded border"
                                style={{ backgroundColor: customColors.accent }}
                              />
                            </div>
                          </div>
                          
                          {/* Destructive Color */}
                          <div className="space-y-2">
                            <Label htmlFor="color-destructive" className="text-caption">{t('settings.general.customTheme.destructive')}</Label>
                            <div className="flex gap-2">
                              <Input
                                id="color-destructive"
                                type="text"
                                value={customColors.destructive}
                                onChange={(e) => setCustomColors({ destructive: e.target.value })}
                                placeholder="oklch(0.6 0.2 25)"
                                className="font-mono text-xs"
                              />
                              <div 
                                className="w-10 h-10 rounded border"
                                style={{ backgroundColor: customColors.destructive }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-caption text-muted-foreground">
                          {t('settings.general.customTheme.helpText')}
                        </p>
                      </div>
                    )}
                    
                    {/* Include Co-authored By */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label htmlFor="coauthored">{t('settings.general.coauthored.label')}</Label>
                        <p className="text-caption text-muted-foreground">
                          {t('settings.general.coauthored.description')}
                        </p>
                      </div>
                      <Switch
                        id="coauthored"
                        checked={settings?.includeCoAuthoredBy !== false}
                        onCheckedChange={(checked) => updateSetting("includeCoAuthoredBy", checked)}
                      />
                    </div>
                    
                    {/* Verbose Output */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label htmlFor="verbose">{t('settings.general.verbose.label')}</Label>
                        <p className="text-caption text-muted-foreground">
                          {t('settings.general.verbose.description')}
                        </p>
                      </div>
                      <Switch
                        id="verbose"
                        checked={settings?.verbose === true}
                        onCheckedChange={(checked) => updateSetting("verbose", checked)}
                      />
                    </div>
                    
                    {/* Cleanup Period */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label htmlFor="cleanup">{t('settings.general.retention.label')}</Label>
                          <p className="text-caption text-muted-foreground mt-1">
                            {t('settings.general.retention.description')}
                          </p>
                        </div>
                        <Input
                          id="cleanup"
                          type="number"
                          min="1"
                          placeholder="30"
                          value={settings?.cleanupPeriodDays || ""}
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : undefined;
                            updateSetting("cleanupPeriodDays", value);
                          }}
                          className="w-24"
                        />
                      </div>
                    </div>
                    
                    {/* Claude Binary Path Selector */}
                    <div className="space-y-3">
                      <ClaudeVersionSelector
                        selectedPath={currentBinaryPath}
                        onSelect={handleClaudeInstallationSelect}
                        simplified={true}
                      />
                      {binaryPathChanged && (
                        <p className="text-caption text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {t('settings.general.binaryPathChanged')}
                        </p>
                      )}
                    </div>

                    {/* Separator */}
                    <div className="border-t border-border pt-4 mt-6" />
                    
                    {/* Analytics Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="analytics-enabled">{t('settings.general.analytics.label')}</Label>
                        <p className="text-caption text-muted-foreground">
                          {t('settings.general.analytics.description')}
                        </p>
                      </div>
                      <Switch
                        id="analytics-enabled"
                        checked={analyticsEnabled}
                        onCheckedChange={async (checked) => {
                          if (checked) {
                            await analytics.enable();
                            setAnalyticsEnabled(true);
                            trackEvent.settingsChanged('analytics_enabled', true);
                            setToast({ message: t('settings.toasts.analyticsEnabled'), type: "success" });
                          } else {
                            await analytics.disable();
                            setAnalyticsEnabled(false);
                            trackEvent.settingsChanged('analytics_enabled', false);
                            setToast({ message: t('settings.toasts.analyticsDisabled'), type: "success" });
                          }
                        }}
                      />
                    </div>
                    
                    {/* Privacy Info */}
                    {analyticsEnabled && (
                      <div className="rounded-lg border border-border bg-muted/50 p-3">
                        <div className="flex gap-2">
                          <Shield className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-foreground">{t('settings.general.analytics.privacy.title')}</p>
                            <ul className="text-xs text-muted-foreground space-y-0.5">
                              <li>• {t('settings.general.analytics.privacy.item1')}</li>
                              <li>• {t('settings.general.analytics.privacy.item2')}</li>
                              <li>• {t('settings.general.analytics.privacy.item3')}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Tab Persistence Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="tab-persistence">{t('settings.general.tabPersistence.label')}</Label>
                        <p className="text-caption text-muted-foreground">
                          {t('settings.general.tabPersistence.description')}
                        </p>
                      </div>
                      <Switch
                        id="tab-persistence"
                        checked={tabPersistenceEnabled}
                        onCheckedChange={(checked) => {
                          TabPersistenceService.setEnabled(checked);
                          setTabPersistenceEnabled(checked);
                          trackEvent.settingsChanged('tab_persistence_enabled', checked);
                          setToast({ 
                            message: checked 
                              ? t('settings.toasts.tabPersistenceEnabled') 
                              : t('settings.toasts.tabPersistenceDisabled'), 
                            type: "success" 
                          });
                        }}
                      />
                    </div>

                    {/* Startup Intro Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="startup-intro">{t('settings.general.startupIntro.label')}</Label>
                        <p className="text-caption text-muted-foreground">
                          {t('settings.general.startupIntro.description')}
                        </p>
                      </div>
                      <Switch
                        id="startup-intro"
                        checked={startupIntroEnabled}
                        onCheckedChange={async (checked) => {
                          setStartupIntroEnabled(checked);
                          try {
                            await api.saveSetting('startup_intro_enabled', checked ? 'true' : 'false');
                            trackEvent.settingsChanged('startup_intro_enabled', checked);
                            setToast({ 
                              message: checked 
                                ? t('settings.toasts.startupIntroEnabled') 
                                : t('settings.toasts.startupIntroDisabled'), 
                              type: 'success' 
                            });
                          } catch (e) {
                            setToast({ message: t('settings.errors.updatePreferenceFailed'), type: 'error' });
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            {/* Permissions Settings */}
            <TabsContent value="permissions" className="space-y-6">
              <Card className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-heading-4 mb-2">{t('settings.permissions.title')}</h3>
                    <p className="text-body-small text-muted-foreground mb-4">
                      {t('settings.permissions.description')}
                    </p>
                  </div>
                  
                  {/* Allow Rules */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-label text-green-500">{t('settings.permissions.allowRules')}</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addPermissionRule("allow")}
                        className="gap-2 hover:border-green-500/50 hover:text-green-500"
                      >
                        <Plus className="h-3 w-3" />
                        {t('settings.permissions.addRule')}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {allowRules.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2">
                          {t('settings.permissions.noAllowRules')}
                        </p>
                      ) : (
                        allowRules.map((rule) => (
                          <motion.div
                            key={rule.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center gap-2"
                          >
                            <Input
                              placeholder={t('settings.permissions.allowPlaceholder')}
                              value={rule.value}
                              onChange={(e) => updatePermissionRule("allow", rule.id, e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removePermissionRule("allow", rule.id)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  {/* Deny Rules */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-label text-red-500">{t('settings.permissions.denyRules')}</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addPermissionRule("deny")}
                        className="gap-2 hover:border-red-500/50 hover:text-red-500"
                      >
                        <Plus className="h-3 w-3" />
                        {t('settings.permissions.addRule')}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {denyRules.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2">
                          {t('settings.permissions.noDenyRules')}
                        </p>
                      ) : (
                        denyRules.map((rule) => (
                          <motion.div
                            key={rule.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center gap-2"
                          >
                            <Input
                              placeholder={t('settings.permissions.denyPlaceholder')}
                              value={rule.value}
                              onChange={(e) => updatePermissionRule("deny", rule.id, e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removePermissionRule("deny", rule.id)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-2 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      <strong>{t('settings.permissions.examples.title')}</strong>
                    </p>
                    <ul className="text-caption text-muted-foreground space-y-1 ml-4">
                      <li>• <code className="px-1 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400">Bash</code> - {t('settings.permissions.examples.item1')}</li>
                      <li>• <code className="px-1 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400">Bash(npm run build)</code> - {t('settings.permissions.examples.item2')}</li>
                      <li>• <code className="px-1 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400">Bash(npm run test:*)</code> - {t('settings.permissions.examples.item3')}</li>
                      <li>• <code className="px-1 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400">Read(~/.zshrc)</code> - {t('settings.permissions.examples.item4')}</li>
                      <li>• <code className="px-1 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400">Edit(docs/**)</code> - {t('settings.permissions.examples.item5')}</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            {/* Environment Variables */}
            <TabsContent value="environment" className="space-y-6">
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-heading-4">{t('settings.environment.title')}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('settings.environment.description')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addEnvVar}
                      className="gap-2"
                    >
                      <Plus className="h-3 w-3" />
                      {t('settings.environment.addVariable')}
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {envVars.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">
                        {t('settings.environment.noVariables')}
                      </p>
                    ) : (
                      envVars.map((envVar) => (
                        <motion.div
                          key={envVar.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Input
                            placeholder={t('settings.environment.keyPlaceholder')}
                            value={envVar.key}
                            onChange={(e) => updateEnvVar(envVar.id, "key", e.target.value)}
                            className="flex-1 font-mono text-sm"
                          />
                          <span className="text-muted-foreground">=</span>
                          <Input
                            placeholder={t('settings.environment.valuePlaceholder')}
                            value={envVar.value}
                            onChange={(e) => updateEnvVar(envVar.id, "value", e.target.value)}
                            className="flex-1 font-mono text-sm"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeEnvVar(envVar.id)}
                            className="h-8 w-8 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))
                    )}
                  </div>
                  
                  <div className="pt-2 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      <strong>{t('settings.environment.commonVariables.title')}</strong>
                    </p>
                    <ul className="text-caption text-muted-foreground space-y-1 ml-4">
                      <li>• <code className="px-1 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">CLAUDE_CODE_ENABLE_TELEMETRY</code> - {t('settings.environment.commonVariables.item1')}</li>
                      <li>• <code className="px-1 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">ANTHROPIC_MODEL</code> - {t('settings.environment.commonVariables.item2')}</li>
                      <li>• <code className="px-1 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">DISABLE_COST_WARNINGS</code> - {t('settings.environment.commonVariables.item3')}</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </TabsContent>
            {/* Advanced Settings */}
            <TabsContent value="advanced" className="space-y-6">
              <Card className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-semibold mb-4">{t('settings.advanced.title')}</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      {t('settings.advanced.description')}
                    </p>
                  </div>
                  
                  {/* API Key Helper */}
                  <div className="space-y-2">
                    <Label htmlFor="apiKeyHelper">{t('settings.advanced.apiKeyHelper.label')}</Label>
                    <Input
                      id="apiKeyHelper"
                      placeholder="/path/to/generate_api_key.sh"
                      value={settings?.apiKeyHelper || ""}
                      onChange={(e) => updateSetting("apiKeyHelper", e.target.value || undefined)}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('settings.advanced.apiKeyHelper.description')}
                    </p>
                  </div>
                  
                  {/* Raw JSON Editor */}
                  <div className="space-y-2">
                    <Label>{t('settings.advanced.rawJson.label')}</Label>
                    <div className="p-3 rounded-md bg-muted font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                      <pre>{JSON.stringify(settings, null, 2)}</pre>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('settings.advanced.rawJson.description')}
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            {/* Hooks Settings */}
            <TabsContent value="hooks" className="space-y-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold mb-2">{t('settings.hooks.title')}</h3>
                    <p className="text-body-small text-muted-foreground mb-4">
                      {t('settings.hooks.description')}
                      <code className="mx-1 px-2 py-1 bg-muted rounded text-xs">~/.claude/settings.json</code>
                    </p>
                  </div>
                  
                  <HooksEditor
                    key={activeTab}
                    scope="user"
                    className="border-0"
                    hideActions={true}
                    onChange={(hasChanges, getHooks) => {
                      setUserHooksChanged(hasChanges);
                      getUserHooks.current = getHooks;
                    }}
                  />
                </div>
              </Card>
            </TabsContent>
            
            {/* Commands Tab */}
            <TabsContent value="commands">
              <Card className="p-6">
                <SlashCommandsManager className="p-0" />
              </Card>
            </TabsContent>
            
            {/* Storage Tab */}
            <TabsContent value="storage">
              <StorageTab />
            </TabsContent>
            
            {/* Proxy Settings */}
            <TabsContent value="proxy">
              <Card className="p-6">
                <ProxySettings 
                  setToast={setToast}
                  onChange={(hasChanges, _getSettings, save) => {
                    setProxySettingsChanged(hasChanges);
                    saveProxySettings.current = save;
                  }}
                />
              </Card>
            </TabsContent>
            
          </Tabs>
        </div>
      )}
      </div>
      
      {/* Toast Notification */}
      <ToastContainer>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onDismiss={() => setToast(null)}
          />
        )}
      </ToastContainer>
      
      
    </div>
  );
}; 
