import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  MapPin,
  Instagram,
  MessageCircle,
  ShieldCheck,
  Wrench,
  CreditCard,
  Bike,
  ArrowRight,
  Search,
  BadgeCheck,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  Tags,
  KeyRound,
  Mail,
  Lock,
  Upload,
} from "lucide-react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * MIAMI MOTOS — Web + Panel ONLINE (Supabase)
 *
 * Env:
 *  - VITE_SUPABASE_URL
 *  - VITE_SUPABASE_ANON_KEY
 */

type MotoType = "Urbana" | "Enduro" | "Deportiva" | "Touring" | "Street" | "Scooter";

export type InventoryItem = {
  id: string;
  marca: string;
  modelo: string;
  tipo: MotoType;
  cilindrada: number;
  destacado?: string;
  priceContadoARS?: number;
  priceFinanciadoARS?: number;
  financiacionDNI: boolean;
  disponible: boolean;
  imageUrl?: string;
};

type Quote = {
  nombre: string;
  ciudad: string;
  modelo: string;
  uso: string;
  financiacion: string;
};

const BRAND = {
  name: "MIAMI MOTOS",
  phoneDisplay: "341 2728-142",
  phoneIntl: "+543412728142",
  whatsappText: "Hola Miami Motos! Quiero consultar por precios y financiación con DNI.",
  instagram: "https://www.instagram.com/miamimotosoficial/",
  hours: "10:00 a 20:00",
  locations: [
    {
      name: "San Lorenzo",
      address: "Av. San Martín 750, San Lorenzo, Santa Fe",
      maps: "https://maps.google.com/?q=Av.+San+Martin+750+San+Lorenzo+Santa+Fe",
    },
    {
      name: "Rosario (Bv. Oroño)",
      address: "Bv. Oroño 6060, Rosario, Santa Fe",
      maps: "https://maps.google.com/?q=Bv.+Oro%C3%B1o+6060+Rosario+Santa+Fe",
    },
    {
      name: "Rosario (Av. Uriburu)",
      address: "Av. Uriburu 1050, Rosario, Santa Fe",
      maps: "https://maps.google.com/?q=Av.+Uriburu+1050+Rosario+Santa+Fe",
    },
  ],
} as const;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatARS(n?: number) {
  if (!n || Number.isNaN(n)) return "Consultar";
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

function whatsappHref(message?: string) {
  const base = `https://wa.me/${BRAND.phoneIntl.replace(/\\+/g, "")}`;
  const text = encodeURIComponent(message || BRAND.whatsappText);
  return `${base}?text=${text}`;
}

export function buildQuoteMessage(quote: Partial<Quote>) {
  const parts = [
    "Hola Miami Motos! Quiero una cotización.",
    quote?.nombre ? `Nombre: ${quote.nombre}` : null,
    quote?.ciudad ? `Ciudad: ${quote.ciudad}` : null,
    quote?.modelo ? `Modelo / Tipo: ${quote.modelo}` : null,
    quote?.uso ? `Uso: ${quote.uso}` : null,
    quote?.financiacion ? `Financiación con DNI: ${quote.financiacion}` : null,
  ].filter(Boolean) as string[];
  return parts.join("\\n");
}

function buildMotoWhatsApp(item: InventoryItem) {
  const lines = [
    `Hola Miami Motos! Quiero consultar por: ${item.marca} ${item.modelo}.`,
    `Tipo: ${item.tipo} • ${item.cilindrada}cc`,
    `Contado: ${formatARS(item.priceContadoARS)}`,
    `Financiado: ${formatARS(item.priceFinanciadoARS)}`,
    item.financiacionDNI ? "Financiación con DNI: Sí" : "Financiación con DNI: Consultar",
    "Garantía oficial y servicio post-venta.",
  ];
  return lines.join("\\n");
}

function safeId() {
  return `m_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: "honda-wave110-base", marca: "Honda", modelo: "Wave 110 Base", tipo: "Urbana", cilindrada: 110, destacado: "Clásica y rendidora", financiacionDNI: true, disponible: true },
  { id: "honda-glh150", marca: "Honda", modelo: "GLH150", tipo: "Street", cilindrada: 150, destacado: "Ideal para laburo y ciudad", financiacionDNI: true, disponible: true },
  { id: "honda-cb125", marca: "Honda", modelo: "CB125", tipo: "Street", cilindrada: 125, destacado: "Confort y seguridad", financiacionDNI: true, disponible: true },
  { id: "honda-xr150", marca: "Honda", modelo: "XR150", tipo: "Enduro", cilindrada: 150, destacado: "Enduro liviana", financiacionDNI: true, disponible: true },
  { id: "honda-xr190", marca: "Honda", modelo: "XR190", tipo: "Enduro", cilindrada: 190, destacado: "Potencia y control", financiacionDNI: true, disponible: true },
  { id: "honda-xr300", marca: "Honda", modelo: "XR300", tipo: "Enduro", cilindrada: 300, destacado: "Enduro premium", financiacionDNI: true, disponible: true },

  { id: "yamaha-fz150", marca: "Yamaha", modelo: "FZ150", tipo: "Street", cilindrada: 150, destacado: "Street confiable", financiacionDNI: true, disponible: true },
  { id: "yamaha-xtz250", marca: "Yamaha", modelo: "XTZ250", tipo: "Enduro", cilindrada: 250, destacado: "Doble propósito", financiacionDNI: true, disponible: true },

  { id: "benelli-trk502", marca: "Benelli", modelo: "TRK 502", tipo: "Touring", cilindrada: 502, destacado: "Touring fuerte", financiacionDNI: true, disponible: true },
  { id: "benelli-trk702", marca: "Benelli", modelo: "TRK 702", tipo: "Touring", cilindrada: 702, destacado: "Touring alto nivel", financiacionDNI: true, disponible: true },
  { id: "benelli-302s", marca: "Benelli", modelo: "302S", tipo: "Deportiva", cilindrada: 300, destacado: "Sport agresiva", financiacionDNI: true, disponible: true },

  { id: "gilera-smash-full", marca: "Gilera", modelo: "Smash Full", tipo: "Urbana", cilindrada: 110, destacado: "La más pedida", financiacionDNI: true, disponible: true },
  { id: "gilera-bc150", marca: "Gilera", modelo: "BC150", tipo: "Street", cilindrada: 150, destacado: "Street cómoda", financiacionDNI: true, disponible: true },
  { id: "gilera-sahel150", marca: "Gilera", modelo: "Sahel 150", tipo: "Scooter", cilindrada: 150, destacado: "Comodidad total", financiacionDNI: true, disponible: true },

  { id: "motomel-blitz110", marca: "Motomel", modelo: "Blitz 110", tipo: "Urbana", cilindrada: 110, destacado: "Económica", financiacionDNI: true, disponible: true },
  { id: "motomel-s2full", marca: "Motomel", modelo: "S2 Full", tipo: "Street", cilindrada: 150, destacado: "Full equipada", financiacionDNI: true, disponible: true },
  { id: "motomel-skua150", marca: "Motomel", modelo: "Skua 150", tipo: "Enduro", cilindrada: 150, destacado: "Enduro accesible", financiacionDNI: true, disponible: true },

  { id: "keller-classic110", marca: "Keller", modelo: "Classic 110", tipo: "Urbana", cilindrada: 110, destacado: "Clásica", financiacionDNI: true, disponible: true },
  { id: "keller-cronofull110", marca: "Keller", modelo: "Crono Full 110", tipo: "Urbana", cilindrada: 110, destacado: "Full equipada", financiacionDNI: true, disponible: true },
  { id: "keller-miracle150", marca: "Keller", modelo: "Miracle 150", tipo: "Street", cilindrada: 150, destacado: "Street rendidora", financiacionDNI: true, disponible: true },
  { id: "keller-stratus150", marca: "Keller", modelo: "Stratus 150", tipo: "Street", cilindrada: 150, destacado: "Diseño moderno", financiacionDNI: true, disponible: true },

  { id: "zanella-zb110", marca: "Zanella", modelo: "ZB 110", tipo: "Urbana", cilindrada: 110, destacado: "Clásica urbana", financiacionDNI: true, disponible: true },

  { id: "suzuki-gn125", marca: "Suzuki", modelo: "GN125", tipo: "Street", cilindrada: 125, destacado: "Clásica japonesa", financiacionDNI: true, disponible: true },
  { id: "suzuki-ax100", marca: "Suzuki", modelo: "AX100", tipo: "Street", cilindrada: 100, destacado: "Liviana y ágil", financiacionDNI: true, disponible: true },

  { id: "kawasaki-z400", marca: "Kawasaki", modelo: "Z400", tipo: "Deportiva", cilindrada: 399, destacado: "Street-naked (cilindrada grande)", financiacionDNI: true, disponible: true },
];

// --- Supabase helpers ---
function getEnv(name: string): string | undefined {
  // @ts-expect-error
  return (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[name]) || undefined;
}
const SUPABASE_URL = getEnv("VITE_SUPABASE_URL");
const SUPABASE_ANON_KEY = getEnv("VITE_SUPABASE_ANON_KEY");

function createSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

type DBRow = {
  id: string;
  marca: string;
  modelo: string;
  tipo: string;
  cilindrada: number;
  destacado: string | null;
  price_contado_ars: number | null;
  price_financiado_ars: number | null;
  financiacion_dni: boolean;
  disponible: boolean;
  image_url: string | null;
};

function rowToItem(r: DBRow): InventoryItem {
  return {
    id: r.id,
    marca: r.marca,
    modelo: r.modelo,
    tipo: r.tipo as MotoType,
    cilindrada: r.cilindrada,
    destacado: r.destacado || undefined,
    priceContadoARS: r.price_contado_ars ?? undefined,
    priceFinanciadoARS: r.price_financiado_ars ?? undefined,
    financiacionDNI: !!r.financiacion_dni,
    disponible: !!r.disponible,
    imageUrl: r.image_url || undefined,
  };
}

function itemToRow(i: InventoryItem): DBRow {
  return {
    id: i.id,
    marca: i.marca,
    modelo: i.modelo,
    tipo: i.tipo,
    cilindrada: i.cilindrada,
    destacado: i.destacado ?? null,
    price_contado_ars: i.priceContadoARS ?? null,
    price_financiado_ars: i.priceFinanciadoARS ?? null,
    financiacion_dni: i.financiacionDNI,
    disponible: i.disponible,
    image_url: i.imageUrl ?? null,
  };
}

async function dbFetchInventory(supabase: SupabaseClient): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from("inventory")
    .select("id,marca,modelo,tipo,cilindrada,destacado,price_contado_ars,price_financiado_ars,financiacion_dni,disponible,image_url")
    .order("marca", { ascending: true })
    .order("modelo", { ascending: true });
  if (error) throw error;
  return (data as DBRow[]).map(rowToItem);
}

async function dbUpsertInventory(supabase: SupabaseClient, item: InventoryItem) {
  const row = itemToRow(item);
  const { error } = await supabase.from("inventory").upsert(row, { onConflict: "id" });
  if (error) throw error;
}

async function dbDeleteInventory(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("inventory").delete().eq("id", id);
  if (error) throw error;
}

async function dbSeedIfEmpty(supabase: SupabaseClient) {
  const { count, error } = await supabase.from("inventory").select("id", { count: "exact", head: true });
  if (error) throw error;
  if ((count || 0) > 0) return;

  const rows = DEFAULT_INVENTORY.map(itemToRow);
  const { error: insErr } = await supabase.from("inventory").insert(rows);
  if (insErr) throw insErr;
}

async function storageUploadImage(supabase: SupabaseClient, file: File, itemId: string): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${itemId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("inventory").upload(path, file, { cacheControl: "3600", upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("inventory").getPublicUrl(path);
  if (data?.publicUrl) return data.publicUrl;
  const { data: signed, error: signErr } = await supabase.storage.from("inventory").createSignedUrl(path, 60 * 60 * 24 * 7);
  if (signErr) throw signErr;
  return signed.signedUrl;
}

// UI primitives
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
      {children}
    </span>
  );
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]", className)}>
      {children}
    </div>
  );
}

function Button({
  as = "button",
  href,
  onClick,
  variant = "primary",
  children,
  className,
  disabled,
}: {
  as?: "button" | "a";
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "dark";
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed";
  const styles: Record<string, string> = {
    primary: "bg-fuchsia-500 text-black hover:bg-fuchsia-400 shadow-[0_10px_30px_-12px_rgba(236,72,153,0.65)]",
    ghost: "border border-white/15 bg-white/0 text-white hover:bg-white/10",
    dark: "bg-white text-black hover:bg-white/90",
  };
  const cls = cn(base, styles[variant], className);

  if (as === "a") {
    return (
      <a className={cls} href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <button className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-fuchsia-500 text-black shadow-[0_18px_40px_-18px_rgba(236,72,153,0.8)]">
        <Bike className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-extrabold tracking-[0.18em] text-white">{BRAND.name}</div>
        <div className="text-xs text-white/60">Financiación • Entrega rápida • Garantía y servicio post-venta</div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-4">
      <div className="text-2xl font-extrabold text-white">{value}</div>
      <div className="mt-1 text-xs text-white/60">{label}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-white/60">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-white/35 focus:border-fuchsia-400/60",
        props.className
      )}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn("w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm outline-none focus:border-fuchsia-400/60", props.className)}
    />
  );
}

function MotoCard({ item }: { item: InventoryItem }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <div className="relative h-44 bg-black/40">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={`${item.marca} ${item.modelo}`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center gap-2 text-sm text-white/55">
            <Bike className="h-5 w-5" /> Foto pendiente
          </div>
        )}
        {!item.disponible && (
          <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/70 px-3 py-1 text-xs text-white/80">No disponible</div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold tracking-[0.22em] text-white/60">{item.marca.toUpperCase()}</div>
            <div className="mt-1 text-lg font-extrabold">{item.modelo}</div>
            <div className="mt-1 text-sm text-white/70">
              {item.tipo} • {item.cilindrada}cc{item.destacado ? ` • ${item.destacado}` : ""}
            </div>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-200">
            <Bike className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
            <span className="text-white/70">Contado</span>
            <span className="font-extrabold">{formatARS(item.priceContadoARS)}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
            <span className="text-white/70">Financiado</span>
            <span className="font-extrabold">{formatARS(item.priceFinanciadoARS)}</span>
          </div>
          <div className="text-xs text-white/55">
            Garantía oficial y servicio post-venta. Financiación con DNI: {item.financiacionDNI ? "Sí" : "Consultar"}.
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button as="a" href={whatsappHref(buildMotoWhatsApp(item))} className="w-full">
            Consultar por WhatsApp <ArrowRight className="h-4 w-4" />
          </Button>
          <Button as="a" variant="ghost" href="#cotizacion" className="w-full">
            Cotizar
          </Button>
        </div>
      </div>
    </div>
  );
}

// Auth modal
function AuthModal({ open, onClose, supabase, onAuthed }: { open: boolean; onClose: () => void; supabase: SupabaseClient; onAuthed: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      setLoading(false);
      setEmail("");
      setPassword("");
      setMode("login");
    }
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === "signup") {
        const { error: e } = await supabase.auth.signUp({ email, password });
        if (e) throw e;
        onAuthed();
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
        onAuthed();
      }
    } catch (e: any) {
      setError(e?.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/75" onClick={onClose} role="button" tabIndex={-1} />
      <div className="absolute inset-x-0 top-10 mx-auto w-[min(560px,calc(100%-2rem))]">
        <div className="rounded-3xl border border-white/10 bg-black/90 backdrop-blur p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold tracking-[0.22em] text-white/60">PANEL ONLINE</div>
              <div className="mt-2 text-2xl font-extrabold flex items-center gap-2">
                <KeyRound className="h-5 w-5" /> {mode === "login" ? "Iniciar sesión" : "Crear usuario"}
              </div>
              <div className="mt-1 text-sm text-white/70">Acceso al panel de concesionario.</div>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <LogOut className="h-4 w-4" /> Cerrar
            </Button>
          </div>

          <div className="mt-6 grid gap-4">
            <Field label="Email">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@miamimotos.com" />
              </div>
            </Field>
            <Field label="Contraseña">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input className="pl-10" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </Field>

            {error && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={submit} disabled={loading || !email || password.length < 6}>
                {loading ? "Procesando..." : mode === "login" ? "Entrar" : "Crear"}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
                {mode === "login" ? "Crear usuario" : "Ya tengo usuario"}
              </Button>
            </div>
            <div className="text-xs text-white/45">Tip: si no querés “Crear usuario”, dejalo en Login y usá tu usuario admin de Supabase.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminModal({
  open,
  onClose,
  items,
  setItems,
  supabase,
}: {
  open: boolean;
  onClose: () => void;
  items: InventoryItem[];
  setItems: (next: InventoryItem[]) => void;
  supabase: SupabaseClient;
}) {
  const [draft, setDraft] = useState<InventoryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) {
      setDraft(null);
      setError(null);
      setSaving(false);
      setUploading(false);
    }
  }, [open]);

  const brands = useMemo(() => {
    const set = new Set(items.map((i) => i.marca));
    return Array.from(set).sort();
  }, [items]);

  if (!open) return null;

  const startNew = () => {
    setDraft({
      id: safeId(),
      marca: brands[0] || "Honda",
      modelo: "",
      tipo: "Urbana",
      cilindrada: 110,
      destacado: "",
      financiacionDNI: true,
      disponible: true,
      imageUrl: "",
    });
  };

  const saveDraft = async () => {
    if (!draft) return;
    if (!draft.marca.trim() || !draft.modelo.trim()) {
      setError("Marca y modelo son obligatorios.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await dbUpsertInventory(supabase, draft);
      const idx = items.findIndex((x) => x.id === draft.id);
      const next = [...items];
      if (idx >= 0) next[idx] = draft;
      else next.unshift(draft);
      setItems(next);
      setDraft(null);
    } catch (e: any) {
      setError(e?.message || "Error guardando");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      await dbDeleteInventory(supabase, id);
      setItems(items.filter((x) => x.id !== id));
      if (draft?.id === id) setDraft(null);
    } catch (e: any) {
      setError(e?.message || "Error eliminando");
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  const handleFile = async (file: File) => {
    if (!draft) return;
    setUploading(true);
    setError(null);
    try {
      const url = await storageUploadImage(supabase, file, draft.id);
      setDraft({ ...draft, imageUrl: url });
    } catch (e: any) {
      setError(e?.message || "Error subiendo imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/75" onClick={onClose} role="button" tabIndex={-1} />
      <div className="absolute inset-x-0 top-6 mx-auto w-[min(1100px,calc(100%-2rem))]">
        <div className="rounded-3xl border border-white/10 bg-black/90 backdrop-blur p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-semibold tracking-[0.22em] text-white/60">PANEL DE CONCESIONARIO</div>
              <div className="mt-2 text-2xl font-extrabold">Stock / Precios / Fotos</div>
              <div className="mt-1 text-sm text-white/70">Cambios visibles online.</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={startNew}>
                <Plus className="h-4 w-4" /> Nueva moto
              </Button>
              <Button variant="ghost" onClick={logout}>
                <LogOut className="h-4 w-4" /> Salir
              </Button>
            </div>
          </div>

          {error && <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-sm font-extrabold">Listado</div>
              <div className="mt-3 max-h-[55vh] overflow-auto pr-2">
                <div className="grid gap-2">
                  {items.map((it) => (
                    <button
                      key={it.id}
                      onClick={() => setDraft(it)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition",
                        draft?.id === it.id ? "border-fuchsia-400/40 bg-fuchsia-500/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                      )}
                    >
                      <div>
                        <div className="font-bold">
                          {it.marca} {it.modelo}
                          {!it.disponible && (
                            <span className="ml-2 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-white/70">No disponible</span>
                          )}
                        </div>
                        <div className="mt-0.5 text-xs text-white/60">
                          {it.tipo} • {it.cilindrada}cc • Contado: {formatARS(it.priceContadoARS)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void deleteItem(it.id);
                        }}
                        className="rounded-xl border border-white/10 bg-white/[0.02] p-2 text-white/70 hover:bg-white/[0.06]"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-sm font-extrabold">Editor</div>
              {!draft ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/70">Elegí una moto o tocá “Nueva moto”.</div>
              ) : (
                <div className="mt-4 grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Marca">
                      <Select value={draft.marca} onChange={(e) => setDraft({ ...draft, marca: e.target.value })}>
                        {Array.from(new Set([...brands, "Honda", "Yamaha", "Benelli", "Gilera", "Motomel", "Keller", "Zanella", "Suzuki", "Kawasaki"]))
                          .sort()
                          .map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                      </Select>
                    </Field>
                    <Field label="Modelo">
                      <Input value={draft.modelo} onChange={(e) => setDraft({ ...draft, modelo: e.target.value })} placeholder="Ej: XR150" />
                    </Field>
                    <Field label="Tipo">
                      <Select value={draft.tipo} onChange={(e) => setDraft({ ...draft, tipo: e.target.value as MotoType })}>
                        {["Urbana", "Street", "Enduro", "Deportiva", "Touring", "Scooter"].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Cilindrada (cc)">
                      <Input type="number" value={draft.cilindrada} onChange={(e) => setDraft({ ...draft, cilindrada: Number(e.target.value) || 0 })} />
                    </Field>
                  </div>

                  <Field label="Destacado">
                    <Input value={draft.destacado || ""} onChange={(e) => setDraft({ ...draft, destacado: e.target.value })} placeholder="Ej: Ideal para ciudad..." />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Precio contado (ARS)">
                      <Input type="number" value={draft.priceContadoARS ?? ""} onChange={(e) => setDraft({ ...draft, priceContadoARS: e.target.value === "" ? undefined : Number(e.target.value) })} />
                    </Field>
                    <Field label="Precio financiado (ARS)">
                      <Input type="number" value={draft.priceFinanciadoARS ?? ""} onChange={(e) => setDraft({ ...draft, priceFinanciadoARS: e.target.value === "" ? undefined : Number(e.target.value) })} />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-white/60"><Tags className="h-4 w-4" /> FLAGS</div>
                      <div className="mt-3 grid gap-2 text-sm">
                        <label className="flex items-center gap-2 text-white/80">
                          <input type="checkbox" checked={draft.disponible} onChange={(e) => setDraft({ ...draft, disponible: e.target.checked })} /> Disponible
                        </label>
                        <label className="flex items-center gap-2 text-white/80">
                          <input type="checkbox" checked={draft.financiacionDNI} onChange={(e) => setDraft({ ...draft, financiacionDNI: e.target.checked })} /> Financiación con DNI
                        </label>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-white/60"><ImageIcon className="h-4 w-4" /> FOTO</div>
                      <div className="mt-3 grid gap-3">
                        <Input value={draft.imageUrl || ""} onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} placeholder="Pegá URL de imagen (https://...)" />
                        <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                          {draft.imageUrl ? (
                            <img src={draft.imageUrl} alt={`${draft.marca} ${draft.modelo}`} className="h-40 w-full rounded-xl object-cover" />
                          ) : (
                            <div className="flex h-40 items-center justify-center gap-2 text-sm text-white/50"><ImageIcon className="h-5 w-5" /> Sin foto</div>
                          )}
                        </div>
                        <label className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/0 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 cursor-pointer">
                          <Upload className="h-4 w-4" />
                          {uploading ? "Subiendo..." : "Subir foto (archivo)"}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }} disabled={uploading} />
                        </label>
                        <div className="text-xs text-white/45">Bucket de Storage: inventory</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button onClick={() => void saveDraft()} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Guardando..." : "Guardar"}</Button>
                    <Button variant="ghost" onClick={() => setDraft(null)} disabled={saving}>Cancelar</Button>
                    <Button variant="ghost" as="a" href={whatsappHref(buildMotoWhatsApp(draft))}>Probar WhatsApp <ArrowRight className="h-4 w-4" /></Button>
                  </div>

                  <div className="text-xs text-white/45">Tip: si dejás precios vacíos, aparece “Consultar”.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// tests
export const __TESTS__ = { buildQuoteMessage, formatARS };
(function runSelfTests() {
  // @ts-expect-error
  if (typeof process !== "undefined" && process?.env?.NODE_ENV === "test") {
    const msg = buildQuoteMessage({ nombre: "Rebeca", ciudad: "Rosario" });
    if (!msg.includes("Hola Miami Motos!")) throw new Error("Test greeting failed");
    if (!msg.includes("Nombre: Rebeca")) throw new Error("Test nombre failed");
    if (!msg.includes("Ciudad: Rosario")) throw new Error("Test ciudad failed");
    if (!msg.includes("\\n")) throw new Error("Test newline join failed");
    if (formatARS(undefined) !== "Consultar") throw new Error("Test formatARS consult failed");
  }
})();

export default function MiamiMotosSite() {
  const supabase = useMemo(() => createSupabase(), []);

  const [inventory, setInventory] = useState<InventoryItem[]>(DEFAULT_INVENTORY);
  const [loadingInv, setLoadingInv] = useState(false);
  const [invError, setInvError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("Todas");
  const [typeFilter, setTypeFilter] = useState<string>("Todos");
  const [ccFilter, setCcFilter] = useState<string>("Todas");

  const [authOpen, setAuthOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  const [quote, setQuote] = useState<Quote>({ nombre: "", ciudad: "", modelo: "", uso: "Ciudad", financiacion: "Sí" });
  const quoteMessage = useMemo(() => buildQuoteMessage(quote), [quote]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!supabase) return;
      setLoadingInv(true);
      setInvError(null);
      try {
        await dbSeedIfEmpty(supabase);
        const items = await dbFetchInventory(supabase);
        if (mounted) setInventory(items);
      } catch (e: any) {
        if (mounted) setInvError(e?.message || "Error cargando catálogo");
      } finally {
        if (mounted) setLoadingInv(false);
      }
    };
    void run();
    return () => { mounted = false; };
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    let unsub: any;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSessionEmail(data.session?.user?.email || null);
      unsub = supabase.auth.onAuthStateChange((_evt, s) => {
        setSessionEmail(s?.user?.email || null);
      });
    };
    void init();
    return () => {
      try { unsub?.data?.subscription?.unsubscribe?.(); } catch { /* noop */ }
    };
  }, [supabase]);

  const brands = useMemo(() => {
    const set = new Set(inventory.map((i) => i.marca));
    return ["Todas", ...Array.from(set).sort()];
  }, [inventory]);

  const types = useMemo(() => {
    const set = new Set(inventory.map((i) => i.tipo));
    return ["Todos", ...Array.from(set).sort()];
  }, [inventory]);

  const ccs = useMemo(() => {
    const set = new Set(inventory.map((i) => i.cilindrada));
    const list = Array.from(set).sort((a, b) => a - b).map(String);
    return ["Todas", ...list];
  }, [inventory]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inventory
      .filter((it) => (brandFilter === "Todas" ? true : it.marca === brandFilter))
      .filter((it) => (typeFilter === "Todos" ? true : it.tipo === typeFilter))
      .filter((it) => (ccFilter === "Todas" ? true : String(it.cilindrada) === ccFilter))
      .filter((it) => (q ? [it.marca, it.modelo, it.tipo, it.destacado].filter(Boolean).some((f) => String(f).toLowerCase().includes(q)) : true))
      .sort((a, b) => (b.disponible === a.disponible ? 0 : b.disponible ? 1 : -1));
  }, [inventory, query, brandFilter, typeFilter, ccFilter]);

  const openAdmin = () => {
    if (!supabase) {
      alert("El panel online requiere configurar Supabase (URL + ANON KEY).");
      return;
    }
    if (sessionEmail) setAdminOpen(true);
    else setAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(236,72,153,0.22),transparent_55%),radial-gradient(900px_circle_at_80%_25%,rgba(255,255,255,0.06),transparent_50%),radial-gradient(900px_circle_at_50%_85%,rgba(236,72,153,0.10),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:44px_44px]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <LogoMark />
          <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
            <a className="hover:text-white" href="#catalogo">Catálogo</a>
            <a className="hover:text-white" href="#cotizacion">Cotizá</a>
            <a className="hover:text-white" href="#financiacion">Financiación</a>
            <a className="hover:text-white" href="#postventa">Post-venta</a>
            <a className="hover:text-white" href="#sucursales">Sucursales</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button as="a" variant="ghost" href={`tel:${BRAND.phoneIntl}`}><Phone className="h-4 w-4" /><span className="hidden sm:inline">{BRAND.phoneDisplay}</span></Button>
            <Button as="a" href={whatsappHref()}><MessageCircle className="h-4 w-4" /> WhatsApp</Button>
            <button className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-white/70 hover:bg-white/[0.06]" onClick={openAdmin} title="Panel">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-10 pt-10 md:pt-14">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="flex flex-wrap gap-2">
              <Pill><BadgeCheck className="mr-2 h-4 w-4" /> Concesionario • Habitualista</Pill>
              <Pill><ShieldCheck className="mr-2 h-4 w-4" /> Compra segura</Pill>
              <Pill><CreditCard className="mr-2 h-4 w-4" /> Financiación rápida</Pill>
            </div>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
              <span className="text-white">Financiamos</span> <span className="text-fuchsia-400">solo con tu DNI</span>.
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/70 md:text-lg">
              Llevate tu moto ya, en el momento. Catálogo por marcas con garantía oficial y servicio post-venta.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button as="a" href={whatsappHref("Hola Miami Motos! Quiero financiación con DNI y disponibilidad.")}>Consultar ahora <ArrowRight className="h-4 w-4" /></Button>
              <Button as="a" variant="ghost" href="#catalogo">Ver catálogo</Button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <Stat value={BRAND.hours} label="Horario" />
              <Stat value="DNI" label="Requisitos simples" />
              <Stat value="Post-venta" label="Garantía + service" />
            </div>
            <div className="mt-3 text-xs text-white/45">*Sujeto a disponibilidad y aprobación.</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}>
            <Card className="relative overflow-hidden">
              <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-fuchsia-500/25 blur-2xl" />
              <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold tracking-[0.22em] text-white/60">BÚSQUEDA RÁPIDA</div>
                    <div className="mt-2 text-2xl font-extrabold">Encontrá tu moto</div>
                    <div className="mt-2 text-sm text-white/70">Buscá por marca, modelo, tipo o cilindrada.</div>
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5">
                    <Search className="h-5 w-5 text-white/80" />
                  </div>
                </div>

                <div className="mt-5">
                  <label className="text-xs text-white/60">Buscar</label>
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ej: Z400, XR, TRK, 150..." />
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="text-xs text-white/60">Marca</label>
                      <Select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="mt-2">
                        {brands.map((b) => (<option key={b} value={b}>{b}</option>))}
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-white/60">Tipo</label>
                      <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="mt-2">
                        {types.map((t) => (<option key={t} value={t}>{t}</option>))}
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-white/60">Cilindrada</label>
                      <Select value={ccFilter} onChange={(e) => setCcFilter(e.target.value)} className="mt-2">
                        {ccs.map((c) => (<option key={c} value={c}>{c}</option>))}
                      </Select>
                    </div>
                  </div>

                  <div className="text-xs text-white/60">Resultados: <span className="text-white/85 font-semibold">{filtered.length}</span></div>

                  <Button as="a" variant="ghost" href="#catalogo">Ver resultados en catálogo <ArrowRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <section id="catalogo" className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold tracking-[0.22em] text-white/60">CATÁLOGO</div>
            <h2 className="mt-2 text-3xl font-extrabold">Motos por marca</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/70">Precios contado y financiado. Garantía oficial y servicio post-venta.</p>
          </div>
          <Button as="a" variant="ghost" href={whatsappHref("Hola Miami Motos! Quiero una recomendación según mi uso y presupuesto.")}>
            Pedir recomendación <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {(loadingInv || invError) && (
          <div className="mt-6">
            {loadingInv && <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/70">Cargando catálogo...</div>}
            {invError && <div className="mt-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">{invError}</div>}
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((it) => (<MotoCard key={it.id} item={it} />))}
        </div>
      </section>

      <section id="cotizacion" className="mx-auto max-w-6xl px-4 py-10">
        <Card className="relative overflow-hidden">
          <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-2xl" />
          <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="text-xs font-semibold tracking-[0.22em] text-white/60">COTIZACIÓN</div>
              <h2 className="mt-2 text-3xl font-extrabold">Cotizá por WhatsApp en <span className="text-fuchsia-400">1 minuto</span></h2>
              <p className="mt-3 text-sm text-white/70">Completá estos datos y te respondemos con opciones, precio y financiación.</p>
              <div className="mt-5 flex flex-wrap gap-2"><Pill>Respuesta rápida</Pill><Pill>Stock real</Pill><Pill>Financiación DNI</Pill></div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre"><Input value={quote.nombre} onChange={(e) => setQuote((q) => ({ ...q, nombre: e.target.value }))} placeholder="Tu nombre" /></Field>
                <Field label="Ciudad"><Input value={quote.ciudad} onChange={(e) => setQuote((q) => ({ ...q, ciudad: e.target.value }))} placeholder="Rosario / San Lorenzo..." /></Field>
                <div className="sm:col-span-2">
                  <Field label="Modelo o tipo"><Input value={quote.modelo} onChange={(e) => setQuote((q) => ({ ...q, modelo: e.target.value }))} placeholder="Ej: Z400, XR, TRK, 150..." /></Field>
                </div>
                <Field label="Uso"><Select value={quote.uso} onChange={(e) => setQuote((q) => ({ ...q, uso: e.target.value }))}><option>Ciudad</option><option>Ruta</option><option>Tierra / Enduro</option><option>Mixto</option></Select></Field>
                <Field label="Financiación con DNI"><Select value={quote.financiacion} onChange={(e) => setQuote((q) => ({ ...q, financiacion: e.target.value }))}><option>Sí</option><option>No</option><option>No sé / consultar</option></Select></Field>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button as="a" href={whatsappHref(quoteMessage)}>Enviar por WhatsApp <ArrowRight className="h-4 w-4" /></Button>
                <Button variant="ghost" onClick={() => setQuote({ nombre: "", ciudad: "", modelo: "", uso: "Ciudad", financiacion: "Sí" })}>Limpiar</Button>
              </div>
              <div className="mt-3 text-xs text-white/45">Te asesoramos por WhatsApp.</div>
            </div>
          </div>
        </Card>
      </section>

      <section id="financiacion" className="mx-auto max-w-6xl px-4 py-10">
        <Card>
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="text-xs font-semibold tracking-[0.22em] text-white/60">FINANCIACIÓN</div>
              <h2 className="mt-2 text-3xl font-extrabold">Financiamos <span className="text-fuchsia-400">solo con tu DNI</span></h2>
              <p className="mt-3 text-sm text-white/70">Te explicamos requisitos, cuotas y plazos. Nuestro objetivo: que salgas andando sin vueltas.</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button as="a" href={whatsappHref("Hola Miami Motos! Quiero saber requisitos y cuotas para financiar con DNI.")}>Simular cuotas <ArrowRight className="h-4 w-4" /></Button>
                <Button as="a" variant="ghost" href={`tel:${BRAND.phoneIntl}`}>Llamar <Phone className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                { icon: <CreditCard className="h-5 w-5" />, title: "Proceso simple", desc: "Datos mínimos y guiado paso a paso." },
                { icon: <ShieldCheck className="h-5 w-5" />, title: "Operación transparente", desc: "Condiciones claras antes de avanzar." },
                { icon: <BadgeCheck className="h-5 w-5" />, title: "Entrega y papeles", desc: "Te ayudamos con documentación y retiro." },
              ].map((x) => (
                <div key={x.title} className="flex gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-200">{x.icon}</div>
                  <div>
                    <div className="text-sm font-extrabold">{x.title}</div>
                    <div className="mt-1 text-sm text-white/70">{x.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section id="postventa" className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold tracking-[0.22em] text-white/60">POST-VENTA</div>
                <h2 className="mt-2 text-3xl font-extrabold">Garantía y servicio</h2>
                <p className="mt-2 text-sm text-white/70">Garantía oficial y servicio post-venta Miami Motos. Te recordamos services y te acompañamos.</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5"><Wrench className="h-5 w-5 text-white/80" /></div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { title: "Service 500 km / 1 mes", desc: "Primer control recomendado." },
                { title: "Service 1000 km", desc: "Obligatorio (garantía)." },
                { title: "Service 3000 km", desc: "Chequeo integral." },
                { title: "Service 6000 km", desc: "Revisión completa." },
              ].map((x) => (
                <div key={x.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-sm font-extrabold">{x.title}</div>
                  <div className="mt-1 text-sm text-white/70">{x.desc}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button as="a" href={whatsappHref("Hola Miami Motos! Quiero pedir turno de service.\\nMi modelo es: \\nKilometraje: \\n")}>Pedir turno de service <ArrowRight className="h-4 w-4" /></Button>
              <Button as="a" variant="ghost" href={whatsappHref("Hola Miami Motos! Quiero que me expliquen garantía y services.")}>Consultar garantía</Button>
            </div>
          </Card>

          <Card>
            <div className="text-xs font-semibold tracking-[0.22em] text-white/60">CONTACTO</div>
            <div className="mt-2 text-xl font-extrabold">Respondemos rápido</div>
            <p className="mt-2 text-sm text-white/70">WhatsApp recomendado para cerrar rápido.</p>
            <div className="mt-5 grid gap-3">
              <Button as="a" href={whatsappHref()}><MessageCircle className="h-4 w-4" /> WhatsApp</Button>
              <Button as="a" variant="ghost" href={`tel:${BRAND.phoneIntl}`}><Phone className="h-4 w-4" /> Llamar</Button>
              <Button as="a" variant="ghost" href={BRAND.instagram}><Instagram className="h-4 w-4" /> Instagram</Button>
            </div>
          </Card>
        </div>
      </section>

      <section id="sucursales" className="mx-auto max-w-6xl px-4 py-10">
        <div>
          <div className="text-xs font-semibold tracking-[0.22em] text-white/60">SUCURSALES</div>
          <h2 className="mt-2 text-3xl font-extrabold">Rosario & San Lorenzo</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/70">Horario: {BRAND.hours}. Tocá “Ver en Maps” para llegar directo.</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {BRAND.locations.map((l) => (
            <Card key={l.name}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-extrabold">{l.name}</div>
                  <div className="mt-1 text-sm text-white/70">{l.address}</div>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5"><MapPin className="h-5 w-5 text-white/80" /></div>
              </div>
              <div className="mt-5">
                <Button as="a" variant="ghost" href={l.maps}>Ver en Maps <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <a
        href={whatsappHref()}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-fuchsia-500 px-4 py-3 text-sm font-extrabold text-black shadow-[0_18px_45px_-18px_rgba(236,72,153,0.85)] hover:bg-fuchsia-400"
      >
        <MessageCircle className="h-4 w-4" /> WhatsApp
      </a>

      <footer className="border-t border-white/10 bg-black/60">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-sm font-extrabold tracking-[0.18em] text-white">{BRAND.name}</div>
              <p className="mt-3 max-w-md text-sm text-white/60">Venta de motos • Financiación con DNI • Garantía y servicio post-venta.</p>
            </div>
            <div className="grid gap-2 text-sm text-white/70">
              <div className="text-xs font-semibold tracking-[0.22em] text-white/60">SECCIONES</div>
              <a className="hover:text-white" href="#catalogo">Catálogo</a>
              <a className="hover:text-white" href="#cotizacion">Cotizá</a>
              <a className="hover:text-white" href="#financiacion">Financiación</a>
              <a className="hover:text-white" href="#postventa">Post-venta</a>
              <a className="hover:text-white" href="#sucursales">Sucursales</a>
            </div>
            <div className="grid gap-3">
              <div className="text-xs font-semibold tracking-[0.22em] text-white/60">CONTACTO</div>
              <a className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white" href={`tel:${BRAND.phoneIntl}`}><Phone className="h-4 w-4" /> {BRAND.phoneDisplay}</a>
              <a className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white" href={whatsappHref()} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
              <a className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white" href={BRAND.instagram} target="_blank" rel="noreferrer"><Instagram className="h-4 w-4" /> Instagram</a>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} {BRAND.name}. Horario: {BRAND.hours}.</div>
            <div className="text-white/70">Panel: {sessionEmail ? <>Conectada como <span className="text-white">{sessionEmail}</span></> : "No logueada"}</div>
          </div>
        </div>
      </footer>

      {supabase && (
        <AuthModal
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          supabase={supabase}
          onAuthed={() => { setAuthOpen(false); setAdminOpen(true); }}
        />
      )}

      {supabase && sessionEmail && (
        <AdminModal open={adminOpen} onClose={() => setAdminOpen(false)} items={inventory} setItems={setInventory} supabase={supabase} />
      )}
    </div>
  );
}
