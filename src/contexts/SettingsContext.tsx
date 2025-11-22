import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export interface StoreSettings {
    storeName: string;
    logo: string | null; // Base64 string
    banner: string | null; // Base64 string
    primaryColor: string;
    secondaryColor: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    shippingPrice: number;
}

interface SettingsContextType {
    settings: StoreSettings;
    updateSettings: (settings: Partial<StoreSettings>) => void;
}

const defaultSettings: StoreSettings = {
    storeName: "Conexão 011",
    logo: null,
    banner: null,
    primaryColor: "#000000",
    secondaryColor: "#ffffff",
    contactEmail: "contato@conexao011.com.br",
    contactPhone: "(11) 99999-9999",
    address: "São Paulo, SP",
    shippingPrice: 0,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState<StoreSettings>(() => {
        const saved = localStorage.getItem("store_settings");
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    });

    useEffect(() => {
        localStorage.setItem("store_settings", JSON.stringify(settings));

        // Update CSS variables for theme colors
        document.documentElement.style.setProperty("--primary", settings.primaryColor);
        document.documentElement.style.setProperty("--secondary", settings.secondaryColor);

        // Dispatch storage event for other tabs
        window.dispatchEvent(new Event("storage"));
    }, [settings]);

    // Listen for changes from other tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "store_settings" && e.newValue) {
                setSettings(JSON.parse(e.newValue));
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const updateSettings = (newSettings: Partial<StoreSettings>) => {
        setSettings((prev) => ({ ...prev, ...newSettings }));
        toast.success("Configurações salvas com sucesso!");
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
};