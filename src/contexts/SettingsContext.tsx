import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/utils";

export interface StoreSettings {
    storeName: string;
    logo: string | null;
    banner: string | null;
    primaryColor: string;
    secondaryColor: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    shippingPrice: number;
}

interface SettingsContextType {
    settings: StoreSettings;
    updateSettings: (settings: Partial<StoreSettings>) => Promise<void>;
    loading: boolean;
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
    const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('store_settings')
                .select('*')
                .single();

            if (error) {
                // If no settings found, we might need to insert default one, 
                // but the SQL script should have handled it.
                // If it's a "row not found" error (PGRST116), we can ignore or insert.
                if (error.code !== 'PGRST116') {
                    throw error;
                }
            }

            if (data) {
                setSettings({
                    storeName: data.store_name,
                    logo: data.logo,
                    banner: data.banner,
                    primaryColor: data.primary_color,
                    secondaryColor: data.secondary_color,
                    contactEmail: data.contact_email,
                    contactPhone: data.contact_phone,
                    address: data.address,
                    shippingPrice: Number(data.shipping_price)
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            // Don't toast on initial load error to avoid spamming if table is empty
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();

        const channel = supabase
            .channel('public:store_settings')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'store_settings' },
                (payload) => {
                    console.log('Realtime update:', payload);
                    fetchSettings();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Update CSS variables when settings change
    useEffect(() => {
        document.documentElement.style.setProperty("--primary", settings.primaryColor);
        document.documentElement.style.setProperty("--secondary", settings.secondaryColor);
    }, [settings]);

    const updateSettings = async (newSettings: Partial<StoreSettings>) => {
        try {
            const updates: any = {};
            if (newSettings.storeName !== undefined) updates.store_name = newSettings.storeName;
            if (newSettings.logo !== undefined) updates.logo = await uploadImage(newSettings.logo);
            if (newSettings.banner !== undefined) updates.banner = await uploadImage(newSettings.banner);
            if (newSettings.primaryColor !== undefined) updates.primary_color = newSettings.primaryColor;
            if (newSettings.secondaryColor !== undefined) updates.secondary_color = newSettings.secondaryColor;
            if (newSettings.contactEmail !== undefined) updates.contact_email = newSettings.contactEmail;
            if (newSettings.contactPhone !== undefined) updates.contact_phone = newSettings.contactPhone;
            if (newSettings.address !== undefined) updates.address = newSettings.address;
            if (newSettings.shippingPrice !== undefined) updates.shipping_price = newSettings.shippingPrice;

            // We assume there's only one row with ID 1, or we upsert based on some logic.
            // The SQL script inserts ID 1.
            const { error } = await supabase
                .from('store_settings')
                .update(updates)
                .eq('id', 1); // Hardcoded ID 1 for single store settings

            if (error) throw error;

            // Optimistic update or wait for realtime? 
            // Realtime is safer but slower. Let's do optimistic for settings to feel responsive.
            setSettings((prev) => ({ ...prev, ...newSettings }));

            toast.success("Configurações salvas com sucesso!");
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error("Erro ao salvar configurações");
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
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