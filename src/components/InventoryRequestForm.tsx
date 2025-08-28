import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Package, ShoppingCart, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '../integrations/supabase/client';
import { InventoryRequest, Product } from "@/lib/supabase";
import { emailService } from "@/lib/email-service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const requestSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  message: z.string().optional(),
  distributor: z.enum(['Distributor 1', 'Distributor 2', 'Distributor 3']).default('Distributor 2'),
});

type RequestFormData = z.infer<typeof requestSchema>;

// Available products with simple distributor tagging
const availableProducts: (Product & { distributor: 'Distributor 1' | 'Distributor 2' | 'Distributor 3' })[] = [
  {
    id: "PKA0020KYSSDPKK",
    name: "20kg Planet Pet CP Chicken & Turkey",
    price: 17000,
    currency: "JPY",
    description: "20kg Planet Pet CP Chicken & Turkey",
    available_quantity: 100,
    distributor: 'Distributor 2',
  },
  {
    id: "PKI0020KYSSDPKK",
    name: "20kg Planet Pet CP Lamb, Sweet Potato & Apple",
    price: 20000,
    currency: "JPY",
    description: "20kg Planet Pet CP Lamb, Sweet Potato & Apple",
    available_quantity: 100,
    distributor: 'Distributor 2',
  },
  {
    id: "SFI0012KPPSXZZZ",
    name: "12kg Superfood 65 Scottish Salmon Small Breed Dog",
    price: 11000,
    currency: "JPY",
    description: "12kg Superfood 65 Scottish Salmon Small Breed Dog",
    available_quantity: 100,
    distributor: 'Distributor 2',
  },
  {
    id: "GFJ0012KUPSXZZZ",
    name: "12kg GF Duck with Sweet Potato & Orange",
    price: 10000,
    currency: "JPY",
    description: "12kg GF Duck with Sweet Potato & Orange",
    available_quantity: 100,
    distributor: 'Distributor 2',
  },
  {
    id: "GFE0012KPPSDZZZ",
    name: "12kg Light GF Trout with Salmon & Asparagus",
    price: 10500,
    currency: "JPY",
    description: "12kg Light GF Trout with Salmon & Asparagus",
    available_quantity: 100,
    distributor: 'Distributor 2',
  },
  {
    id: "TGE0012KPPSDZZZ",
    name: "12kg Light GF Turkey with Sweet Potato, Cranberry",
    price: 10500,
    currency: "JPY",
    description: "12kg Light GF Turkey with Sweet Potato, Cranberry",
    available_quantity: 100,
    distributor: 'Distributor 2',
  },
  {
    id: "NGE0006KUPSXZZZ",
    name: "6kg Small Breed Lamb Sweet Potato & Mint",
    price: 6000,
    currency: "JPY",
    description: "6kg Small Breed Lamb Sweet Potato & Mint",
    available_quantity: 100,
    distributor: 'Distributor 1',
  },
  {
    id: "SFM0012KPPSXZZZ",
    name: "12kg Superfood 65 Free Range Turkey SmBrd Senior",
    price: 10500,
    currency: "JPY",
    description: "12kg Superfood 65 Free Range Turkey SmBrd Senior",
    available_quantity: 100,
    distributor: 'Distributor 2',
  },
  {
    id: "DGF0006KUPSXZZZ",
    name: "6kg Small Breed GF Duck with Sweet Potato & Orange",
    price: 5500,
    currency: "JPY",
    description: "6kg Small Breed GF Duck with Sweet Potato & Orange",
    available_quantity: 100,
    distributor: 'Distributor 2',
  },
  {
    id: "SFL0012KPPSXZZZ",
    name: "12kg Superfood 65 British Grass Fed Lamb Adult Dog",
    price: 11500,
    currency: "JPY",
    description: "12kg Superfood 65 British Grass Fed Lamb Adult Dog",
    available_quantity: 100,
    distributor: 'Distributor 1',
  },
  {
    id: "CCT0005KPPSXZZZ",
    name: "5kg Connoisseur Cat Adult Turkey & Chicken",
    price: 6000,
    currency: "JPY",
    description: "5kg Connoisseur Cat Adult Turkey & Chicken",
    available_quantity: 100,
    distributor: 'Distributor 1',
  },
  {
    id: "TDP0K070PPIXZZZ",
    name: "25 x70g. Dental Treat",
    price: 10500,
    currency: "JPY",
    description: "25 x70g. Dental Treat",
    available_quantity: 100,
    distributor: 'Distributor 1',
  },
  {
    id: "XGC0K070PPIXZZZ",
    name: "25 x70g. Calming Treat",
    price: 10500,
    currency: "JPY",
    description: "25 x70g. Calming Treat",
    available_quantity: 100,
    distributor: 'Distributor 1',
  },
  {
    id: "XGF0K070PPIXZZZ",
    name: "25 x70g Immune Treat",
    price: 10500,
    currency: "JPY",
    description: "25 x70g Immune Treat",
    available_quantity: 100,
    distributor: 'Distributor 1',
  },
  {
    id: "NGEPPFAUS",
    name: "20kg   CP Lamb, Sweet Potato & Apple",
    price: 9000,
    currency: "JPY",
    description: "20kg   CP Lamb, Sweet Potato & Apple",
    available_quantity: 100,
    distributor: 'Distributor 1',
  },
  {
    id: "KCPFLambCat",
    name: "12.5kg  NZ Grass Fed Lamb Cat",
    price: 9000,
    currency: "JPY",
    description: "12.5kg  NZ Grass Fed Lamb Cat",
    available_quantity: 100,
    distributor: 'Distributor 1',
  },
  {
    id: "KCPFBeefCat",
    name: "12.5kg  NZ Grass Fed Beef Cat",
    price: 9000,
    currency: "JPY",
    description: "12.5kg  NZ Grass Fed Beef Cat",
    available_quantity: 100,
    distributor: 'Distributor 1',
  },
  {
    id: "KCPFLamb1",
    name: "12.5kg Grain Free New Zeland Grass Fed Lamb Formula - Dogs (NZ)",
    price: 6112, // ~= GBP 32.25
    currency: "JPY",
    description: "12.5kg Grain Free New Zeland Grass Fed Lamb Formula - Dogs (NZ)",
    available_quantity: 100,
    distributor: 'Distributor 2',
  },
  {
    id: "KCPFChicken2",
    name: "12.5kg Grain Free New Zeland Chicken Formula - Cats (NZ)",
    price: 6112, // ~= GBP 32.25
    currency: "JPY",
    description: "12.5kg Grain Free New Zeland Chicken Formula - Cats (NZ)",
    available_quantity: 100,
    distributor: 'Distributor 2',
  },
  // Distributor 3 products (USD base)
  { id: "6009688702712", name: "Premier+ Gas", price: 89.90, currency: "USD", description: "Premier+ Gas", available_quantity: 100, distributor: 'Distributor 3' },
  { id: "6009688702583", name: "COBB Pro Black (Matte base)", price: 45.00, currency: "USD", description: "COBB Pro Black (Matte base)", available_quantity: 100, distributor: 'Distributor 3' },
  { id: "6009688702576", name: "COBB Pro Gas", price: 69.50, currency: "USD", description: "COBB Pro Gas", available_quantity: 100, distributor: 'Distributor 3' },
  { id: "6009688700145", name: "Frying Pan and fork", price: 19.75, currency: "USD", description: "Frying Pan and fork", available_quantity: 100, distributor: 'Distributor 3' },
  { id: "6009688700046", name: "Frying Dish (Wok)", price: 16.80, currency: "USD", description: "Frying Dish (Wok)", available_quantity: 100, distributor: 'Distributor 3' },
  { id: "6001651024463", name: "Carrier Bag", price: 6.00, currency: "USD", description: "Carrier Bag", available_quantity: 100, distributor: 'Distributor 3' },
  { id: "6009688701036", name: "Fenced Roast Rack", price: 6.40, currency: "USD", description: "Fenced Roast Rack", available_quantity: 100, distributor: 'Distributor 3' },
  { id: "6009688701005", name: "Dome Extension with Chicken Roasting Stand in box", price: 10.90, currency: "USD", description: "Dome Extension with Chicken Roasting Stand in box", available_quantity: 100, distributor: 'Distributor 3' },
  { id: "6009688701210", name: "Dome Holder (Pro and Premier)", price: 4.10, currency: "USD", description: "Dome Holder (Pro and Premier)", available_quantity: 100, distributor: 'Distributor 3' },
  { id: "6009688702958", name: "BBQ Kit with Fire Grid", price: 18.00, currency: "USD", description: "BBQ Kit with Fire Grid", available_quantity: 100, distributor: 'Distributor 3' },
  { id: "6009688702194", name: "Griddle+", price: 15.90, currency: "USD", description: "Griddle+", available_quantity: 100, distributor: 'Distributor 3' },
  { id: "6009688701883", name: "Stainless Steel Grill Grid", price: 10.50, currency: "USD", description: "Stainless Steel Grill Grid", available_quantity: 100, distributor: 'Distributor 3' },
  { id: "6009688703115", name: "Round carrier bag in Grey colour", price: 6.50, currency: "USD", description: "Round carrier bag in Grey colour", available_quantity: 100, distributor: 'Distributor 3' },
  { id: "6009688703078", name: "Gas COBB Grey Carrier bag", price: 7.80, currency: "USD", description: "Gas COBB Grey Carrier bag", available_quantity: 100, distributor: 'Distributor 3' },
];

const EXCHANGE_RATES: { [key: string]: { [key: string]: number } } = {
  AFN: { JPY: 1.7, USD: 0.011, EUR: 0.010, GBP: 0.0088, AFN: 1 },
  AMD: { JPY: 0.38, USD: 0.0025, EUR: 0.0023, GBP: 0.0020, AMD: 1 },
  AZN: { JPY: 88, USD: 0.52, EUR: 0.48, GBP: 0.42, AZN: 1 },
  BHD: { JPY: 395, USD: 2.65, EUR: 2.45, GBP: 2.11, BHD: 1 },
  BDT: { JPY: 1.4, USD: 0.0084, EUR: 0.0078, GBP: 0.0067, BDT: 1 },
  BTN: { JPY: 1.8, USD: 0.012, EUR: 0.011, GBP: 0.0095, BTN: 1 },
  BND: { JPY: 110, USD: 0.74, EUR: 0.68, GBP: 0.59, BND: 1 },
  KHR: { JPY: 0.036, USD: 0.00024, EUR: 0.00022, GBP: 0.00019, KHR: 1 },
  CNY: { JPY: 21, USD: 0.14, EUR: 0.13, GBP: 0.11, CNY: 1 },
  EUR: { JPY: 160.48, USD: 1.07, GBP: 0.85, EUR: 1 },
  GEL: { JPY: 53, USD: 0.35, EUR: 0.33, GBP: 0.28, GEL: 1 },
  INR: { JPY: 1.8, USD: 0.012, EUR: 0.011, GBP: 0.0095, INR: 1 },
  IDR: { JPY: 0.0096, USD: 0.000064, EUR: 0.000059, GBP: 0.000051, IDR: 1 },
  IRR: { JPY: 0.0035, USD: 0.000023, EUR: 0.000021, GBP: 0.000018, IRR: 1 },
  IQD: { JPY: 0.11, USD: 0.00076, EUR: 0.00070, GBP: 0.00061, IQD: 1 },
  ILS: { JPY: 40, USD: 0.27, EUR: 0.25, GBP: 0.21, ILS: 1 },
  JPY: { JPY: 1, USD: 0.0067, EUR: 0.0062, GBP: 0.0053 },
  JOD: { JPY: 210, USD: 1.41, EUR: 1.30, GBP: 1.12, JOD: 1 },
  KZT: { JPY: 0.32, USD: 0.0021, EUR: 0.0020, GBP: 0.0017, KZT: 1 },
  KWD: { JPY: 485, USD: 3.25, EUR: 3.00, GBP: 2.59, KWD: 1 },
  KGS: { JPY: 1.7, USD: 0.011, EUR: 0.010, GBP: 0.0088, KGS: 1 },
  LAK: { JPY: 0.0070, USD: 0.000047, EUR: 0.000043, GBP: 0.000037, LAK: 1 },
  LBP: { JPY: 0.00017, USD: 0.0000011, EUR: 0.0000010, GBP: 0.00000087, LBP: 1 },
  MYR: { JPY: 32, USD: 0.21, EUR: 0.20, GBP: 0.17, MYR: 1 },
  MVR: { JPY: 9.7, USD: 0.065, EUR: 0.060, GBP: 0.052, MVR: 1 },
  MNT: { JPY: 0.043, USD: 0.000029, EUR: 0.000027, GBP: 0.000023, MNT: 1 },
  MMK: { JPY: 0.071, USD: 0.00047, EUR: 0.00044, GBP: 0.00038, MMK: 1 },
  NPR: { JPY: 1.1, USD: 0.0075, EUR: 0.0069, GBP: 0.0059, NPR: 1 },
  KPW: { JPY: 1.2, USD: 0.0080, EUR: 0.0074, GBP: 0.0064, KPW: 1 },
  OMR: { JPY: 387, USD: 2.59, EUR: 2.39, GBP: 2.06, OMR: 1 },
  PKR: { JPY: 0.54, USD: 0.0036, EUR: 0.0033, GBP: 0.0029, PKR: 1 },
  PHP: { JPY: 2.5, USD: 0.017, EUR: 0.015, GBP: 0.013, PHP: 1 },
  QAR: { JPY: 41, USD: 0.28, EUR: 0.26, GBP: 0.22, QAR: 1 },
  RUB: { JPY: 1.6, USD: 0.011, EUR: 0.010, GBP: 0.0086, RUB: 1 },
  SAR: { JPY: 40, USD: 0.27, EUR: 0.25, GBP: 0.21, SAR: 1 },
  SGD: { JPY: 110, USD: 0.74, EUR: 0.68, GBP: 0.59, SGD: 1 },
  KRW: { JPY: 0.11, USD: 0.00075, EUR: 0.00069, GBP: 0.00059, KRW: 1 },
  LKR: { JPY: 0.49, USD: 0.0033, EUR: 0.0030, GBP: 0.0026, LKR: 1 },
  SYP: { JPY: 0.00015, USD: 0.0000010, EUR: 0.00000092, GBP: 0.00000080, SYP: 1 },
  TWD: { JPY: 4.6, USD: 0.031, EUR: 0.029, GBP: 0.025, TWD: 1 },
  TJS: { JPY: 14, USD: 0.094, EUR: 0.087, GBP: 0.075, TJS: 1 },
  THB: { JPY: 4.1, USD: 0.027, EUR: 0.025, GBP: 0.022, THB: 1 },
  USD: { JPY: 149.25, EUR: 0.93, GBP: 0.79, USD: 1 },
  TRY: { JPY: 4.6, USD: 0.031, EUR: 0.029, GBP: 0.025, TRY: 1 },
  TMT: { JPY: 42, USD: 0.28, EUR: 0.26, GBP: 0.22, TMT: 1 },
  AED: { JPY: 40, USD: 0.27, EUR: 0.25, GBP: 0.21, AED: 1 },
  UZS: { JPY: 0.012, USD: 0.000081, EUR: 0.000075, GBP: 0.000065, UZS: 1 },
  VND: { JPY: 0.0063, USD: 0.000042, EUR: 0.000039, GBP: 0.000034, VND: 1 },
  YER: { JPY: 0.59, USD: 0.0040, EUR: 0.0037, GBP: 0.0032, YER: 1 },
  GBP: { JPY: 189.51, USD: 1.26, EUR: 1.18, GBP: 1 },
};

const getExchangeRate = (fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  // Scenario 1: Direct conversion rate exists (e.g., JPY to USD is defined)
  if (EXCHANGE_RATES[fromCurrency] && EXCHANGE_RATES[fromCurrency][toCurrency] !== undefined) {
    return EXCHANGE_RATES[fromCurrency][toCurrency];
  }

  // Scenario 2: Reverse conversion rate exists (e.g., AFN to JPY is defined, we want JPY to AFN)
  if (EXCHANGE_RATES[toCurrency] && EXCHANGE_RATES[toCurrency][fromCurrency] !== undefined) {
    const rate = EXCHANGE_RATES[toCurrency][fromCurrency];
    if (rate !== 0) {
      return 1 / rate;
    }
  }

  return 0;
};

const countries = [
  { name: "Japan", currency: "JPY", symbol: "¥" },
  { name: "United States", currency: "USD", symbol: "$" },
  { name: "Europe", currency: "EUR", symbol: "€" },
  { name: "United Kingdom", currency: "GBP", symbol: "£" },
  { name: "Afghanistan", currency: "AFN", symbol: "؋" },
  { name: "Armenia", currency: "AMD", symbol: "AMD" },
  { name: "Azerbaijan", currency: "AZN", symbol: "₼" },
  { name: "Bahrain", currency: "BHD", symbol: ".د.ب" },
  { name: "Bangladesh", currency: "BDT", symbol: "৳" },
  { name: "Bhutan", currency: "BTN", symbol: "Nu." },
  { name: "Brunei", currency: "BND", symbol: "$" },
  { name: "Cambodia", currency: "KHR", symbol: "៛" },
  { name: "China", currency: "CNY", symbol: "¥" },
  { name: "Cyprus", currency: "EUR", symbol: "€" },
  { name: "Georgia", currency: "GEL", symbol: "₾" },
  { name: "India", currency: "INR", symbol: "₹" },
  { name: "Indonesia", currency: "IDR", symbol: "Rp" },
  { name: "Iran", currency: "IRR", symbol: "﷼" },
  { name: "Iraq", currency: "IQD", symbol: "ع.د" },
  { name: "Israel", currency: "ILS", symbol: "₪" },
  { name: "Jordan", currency: "JOD", symbol: "د.ا" },
  { name: "Kazakhstan", currency: "KZT", symbol: "₸" },
  { name: "Kuwait", currency: "KWD", symbol: "د.ك" },
  { name: "Kyrgyzstan", currency: "KGS", symbol: "сom" },
  { name: "Laos", currency: "LAK", symbol: "₭" },
  { name: "Lebanon", currency: "LBP", symbol: "ل.ل" },
  { name: "Malaysia", currency: "MYR", symbol: "RM" },
  { name: "Maldives", currency: "MVR", symbol: ".ރ" },
  { name: "Mongolia", currency: "MNT", symbol: "₮" },
  { name: "Myanmar", currency: "MMK", symbol: "Ks" },
  { name: "Nepal", currency: "NPR", symbol: "₨" },
  { name: "North Korea", currency: "KPW", symbol: "₩" },
  { name: "Oman", currency: "OMR", symbol: "ر.ع." },
  { name: "Pakistan", currency: "PKR", symbol: "₨" },
  { name: "Palestine", currency: "ILS", symbol: "₪" },
  { name: "Philippines", currency: "PHP", symbol: "₱" },
  { name: "Qatar", currency: "QAR", symbol: "ر.ق" },
  { name: "Russia", currency: "RUB", symbol: "₽" },
  { name: "Saudi Arabia", currency: "SAR", symbol: "ر.س" },
  { name: "Singapore", currency: "SGD", symbol: "$" },
  { name: "South Korea", currency: "KRW", symbol: "₩" },
  { name: "Sri Lanka", currency: "LKR", symbol: "₨" },
  { name: "Syria", currency: "SYP", symbol: "£" },
  { name: "Taiwan", currency: "TWD", symbol: "NT$" },
  { name: "Tajikistan", currency: "TJS", symbol: "ЅМ" },
  { name: "Thailand", currency: "THB", symbol: "฿" },
  { name: "Timor-Leste", currency: "USD", symbol: "$" },
  { name: "Turkey", currency: "TRY", symbol: "₺" },
  { name: "Turkmenistan", currency: "TMT", symbol: "m" },
  { name: "United Arab Emirates", currency: "AED", symbol: "د.إ" },
  { name: "Uzbekistan", currency: "UZS", symbol: "лв" },
  { name: "Vietnam", currency: "VND", symbol: "₫" },
  { name: "Yemen", currency: "YER", symbol: "﷼" },
];

const InventoryRequestForm = () => {
  const [selectedItems, setSelectedItems] = useState<{[key: string]: number}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [selectedDistributor, setSelectedDistributor] = useState<'Distributor 1' | 'Distributor 2'>('Distributor 2');

  const convertPrice = (price: number, fromCurrency: string) => {
    const rate = getExchangeRate(fromCurrency, selectedCountry.currency);
    console.log(`Converting ${price} ${fromCurrency} to ${selectedCountry.currency} with rate: ${rate}`);
    return price * rate;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  });

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity >= 0) {
      setSelectedItems(prev => ({
        ...prev,
        [productId]: quantity
      }));
    }
  };

  const calculateTotal = () => {
    return Object.entries(selectedItems).reduce((total, [productId, quantity]) => {
      const product = availableProducts.find(p => p.id === productId);
      return total + (product ? convertPrice(product.price, product.currency) * quantity : 0);
    }, 0);
  };

  const getSelectedItems = () => {
    return Object.entries(selectedItems)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = availableProducts.find(p => p.id === productId);
        return {
          product_id: productId,
          product_name: product?.name || "",
          quantity,
          unit_price: convertPrice(product?.price || 0, product?.currency || selectedCountry.currency),
          total_price: convertPrice((product?.price || 0), product?.currency || selectedCountry.currency) * quantity,
          currency: selectedCountry.currency,
          currencySymbol: selectedCountry.symbol,
        };
      });
  };

  const onSubmit = async (data: RequestFormData) => {
    const items = getSelectedItems();
    
    if (items.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one product to request.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create inventory request
      const request: Omit<InventoryRequest, 'id' | 'created_at' | 'updated_at'> = {
        user_email: data.email,
        user_name: data.name,
        total_amount: convertPrice(calculateTotal()),
        currency: selectedCountry.currency,
        status: 'pending',
        user_notes: data.message,
        items: items.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            currency: item.currency,
            currencySymbol: item.currencySymbol,
          })),
      };

      const { data: insertedRequest, error: requestError } = await supabase
        .from('inventory_requests')
        .insert([request])
        .select()
        .single();

      if (requestError) throw requestError;

      // Send email notifications
      const [adminEmailSuccess, userEmailSuccess] = await Promise.all([
        emailService.sendAdminNotification({
          user_name: data.name,
          user_email: data.email,
          items: items.map(item => ({
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            currency: item.currency,
            currencySymbol: item.currencySymbol,
          })),
          total_amount: convertPrice(calculateTotal()),
          currency: selectedCountry.currency,
          currencySymbol: selectedCountry.symbol,
          request_id: insertedRequest.id,
          status: 'pending',
          user_notes: data.message,
        }),
        emailService.sendUserConfirmation({
          user_name: data.name,
          user_email: data.email,
          items: items.map(item => ({
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            currency: item.currency,
            currencySymbol: item.currencySymbol,
          })),
          total_amount: convertPrice(calculateTotal()),
          currency: selectedCountry.currency,
          currencySymbol: selectedCountry.symbol,
          request_id: insertedRequest.id,
          status: 'pending',
          user_notes: data.message,
        })
      ]);

      if (adminEmailSuccess && userEmailSuccess) {
        toast({
          title: "Request Submitted Successfully",
          description: "Your inventory request has been sent to our team. You will receive an email confirmation shortly.",
        });
      } else {
        toast({
          title: "Request Submitted",
          description: "Your request was submitted but some email notifications failed to send. Please check your email or contact support.",
          variant: "destructive",
        });
      }

      // Reset form
      reset();
      setSelectedItems({});

    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Inventory Request Form
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Country Selection */}
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select onValueChange={(value) => {
                const country = countries.find(c => c.name === value);
                if (country) {
                  setSelectedCountry(country);
                }
              }} defaultValue={selectedCountry.name}>
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.name} value={country.name}>
                      {country.name} ({country.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.name.message}</AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.email.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Delivery Information removed - derived from distributor */}

            {/* Product Selection */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Select Products</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="distributor">Distributor</Label>
                  <Select onValueChange={(value) => setSelectedDistributor(value as 'Distributor 1' | 'Distributor 2' | 'Distributor 3')} defaultValue={selectedDistributor}>
                    <SelectTrigger id="distributor">
                      <SelectValue placeholder="Choose distributor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Distributor 1">Distributor 1</SelectItem>
                      <SelectItem value="Distributor 2">Distributor 2</SelectItem>
                      <SelectItem value="Distributor 3">Distributor 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4">
                {availableProducts.filter(p => p.distributor === selectedDistributor).map((product) => (
                  <Card key={product.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span className="font-semibold">{product.name}</span>
                            <Badge variant="secondary">{product.id}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {product.description} 
                          </p>
                          <p className="text-sm font-medium mt-1">
                            {selectedCountry.symbol}{convertPrice(product.price, product.currency).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per unit
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(product.id, (selectedItems[product.id] || 0) - 1)}
                            disabled={(selectedItems[product.id] || 0) <= 0}
                          >
                            -
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {selectedItems[product.id] || 0}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(product.id, (selectedItems[product.id] || 0) + 1)}
                            disabled={(selectedItems[product.id] || 0) >= product.available_quantity}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            {Object.keys(selectedItems).some(key => selectedItems[key] > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getSelectedItems().map((item) => (
                      <div key={item.product_id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <span className="font-medium">{item.product_name}</span>
                          <span className="text-sm text-muted-foreground ml-2">({item.product_id})</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground min-w-[40px] text-center">x{item.quantity}</span>
                          <span className="font-medium min-w-[80px] text-right">{selectedCountry.symbol}{(item.total_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between items-center font-semibold text-lg">
                      <span>Total</span>
                      <span>{selectedCountry.symbol}{(calculateTotal()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Additional Message (Optional)</Label>
              <Textarea
                id="message"
                {...register("message")}
                placeholder="Any additional information or special requirements..."
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Submitting Request..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Inventory Request
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryRequestForm; 