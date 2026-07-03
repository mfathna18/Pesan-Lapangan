"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  GOR_DEFAULT_CURRENCY,
  GOR_DEFAULT_TIMEZONE,
  GOR_TIMEZONE_OPTIONS,
} from "@/domains/owner/constants";
import { updateGorProfileAction } from "@/domains/owner/actions/update-gor-profile.action";
import type { GorProfileData } from "@/domains/owner/types";
import { pageLayout } from "@/lib/layout-system";

type GorProfileFormState = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  description: string;
  logoUrl: string;
  coverImageUrl: string;
  timezone: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  qrisImageUrl: string;
};

type GorProfileFormProps = {
  initialProfile: GorProfileData | null;
};

function createFormState(profile: GorProfileData | null): GorProfileFormState {
  return {
    name: profile?.name ?? "",
    phone: profile?.phone ?? "",
    email: profile?.email ?? "",
    address: profile?.address ?? "",
    city: profile?.city ?? "",
    province: profile?.province ?? "",
    description: profile?.description ?? "",
    logoUrl: profile?.logoUrl ?? "",
    coverImageUrl: profile?.coverImageUrl ?? "",
    timezone: profile?.timezone ?? GOR_DEFAULT_TIMEZONE,
    bankName: profile?.bankName ?? "",
    bankAccountNumber: profile?.bankAccountNumber ?? "",
    bankAccountHolder: profile?.bankAccountHolder ?? "",
    qrisImageUrl: profile?.qrisImageUrl ?? "",
  };
}

export function GorProfileForm({ initialProfile }: GorProfileFormProps) {
  const [form, setForm] = useState(() => createFormState(initialProfile));
  const [savedProfile, setSavedProfile] = useState(initialProfile);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof GorProfileFormState>(
    key: K,
    value: GorProfileFormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const response = await updateGorProfileAction({
        name: form.name,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address,
        city: form.city,
        province: form.province,
        description: form.description || null,
        logoUrl: form.logoUrl || null,
        coverImageUrl: form.coverImageUrl || null,
        timezone: form.timezone,
        bankName: form.bankName || null,
        bankAccountNumber: form.bankAccountNumber || null,
        bankAccountHolder: form.bankAccountHolder || null,
        qrisImageUrl: form.qrisImageUrl || null,
      });

      if (!response.success) {
        setError(response.error);
        return;
      }

      setSavedProfile(response.data);
      setForm(createFormState(response.data));
      setSuccess("Profil GOR berhasil disimpan.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className={pageLayout.cardStack}>
      <PageHeader
        eyebrow="Bisnis"
        title="Profil GOR"
        description="Kelola informasi venue yang akan ditampilkan saat pelanggan melakukan booking."
      />

      <Card>
        <CardHeader>
          <CardTitle>Informasi Utama</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="gor-name">Nama GOR</Label>
            <Input
              id="gor-name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="GOR Lapangan Merdeka"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gor-phone">Telepon</Label>
            <Input
              id="gor-phone"
              type="tel"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="081234567890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gor-email">Email</Label>
            <Input
              id="gor-email"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="info@gorlapangan.com"
            />
          </div>

          {savedProfile ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="gor-slug">Slug Publik</Label>
                <Input
                  id="gor-slug"
                  value={savedProfile.slug}
                  readOnly
                  className="bg-muted/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gor-currency">Mata Uang</Label>
                <Input
                  id="gor-currency"
                  value={savedProfile.currency || GOR_DEFAULT_CURRENCY}
                  readOnly
                  className="bg-muted/40"
                />
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lokasi</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="gor-address">Alamat</Label>
            <Textarea
              id="gor-address"
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="Jl. Olahraga No. 10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gor-city">Kota</Label>
            <Input
              id="gor-city"
              value={form.city}
              onChange={(event) => updateField("city", event.target.value)}
              placeholder="Jakarta Selatan"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gor-province">Provinsi</Label>
            <Input
              id="gor-province"
              value={form.province}
              onChange={(event) => updateField("province", event.target.value)}
              placeholder="DKI Jakarta"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Identitas &amp; Detail</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="gor-description">Deskripsi</Label>
            <Textarea
              id="gor-description"
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="Ceritakan fasilitas dan keunggulan venue kamu."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gor-logo">Logo</Label>
            <Input
              id="gor-logo"
              type="url"
              value={form.logoUrl}
              onChange={(event) => updateField("logoUrl", event.target.value)}
              placeholder="https://example.com/logo.png"
            />
            {form.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.logoUrl}
                alt="Pratinjau logo"
                className="border-border mt-2 h-16 w-16 rounded-lg border object-cover"
              />
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gor-cover">Gambar Sampul</Label>
            <Input
              id="gor-cover"
              type="url"
              value={form.coverImageUrl}
              onChange={(event) =>
                updateField("coverImageUrl", event.target.value)
              }
              placeholder="https://example.com/cover.jpg"
            />
            {form.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.coverImageUrl}
                alt="Pratinjau sampul"
                className="border-border mt-2 h-28 w-full rounded-lg border object-cover"
              />
            ) : null}
          </div>

          <div className="space-y-4 sm:col-span-2">
            <div>
              <h3 className="text-base font-semibold">Informasi Pembayaran</h3>
              <p className="text-muted-foreground text-sm">
                Ditampilkan ke pelanggan saat checkout transfer manual.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gor-bank-name">Nama Bank</Label>
                <Input
                  id="gor-bank-name"
                  value={form.bankName}
                  onChange={(event) =>
                    updateField("bankName", event.target.value)
                  }
                  placeholder="BCA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gor-bank-number">Nomor Rekening</Label>
                <Input
                  id="gor-bank-number"
                  value={form.bankAccountNumber}
                  onChange={(event) =>
                    updateField("bankAccountNumber", event.target.value)
                  }
                  placeholder="1234567890"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="gor-bank-holder">Atas Nama</Label>
                <Input
                  id="gor-bank-holder"
                  value={form.bankAccountHolder}
                  onChange={(event) =>
                    updateField("bankAccountHolder", event.target.value)
                  }
                  placeholder="GOR ABC"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="gor-qris">URL QRIS</Label>
                <Input
                  id="gor-qris"
                  type="url"
                  value={form.qrisImageUrl}
                  onChange={(event) =>
                    updateField("qrisImageUrl", event.target.value)
                  }
                  placeholder="https://example.com/qris.png"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="gor-timezone">Zona Waktu</Label>
            <Select
              value={form.timezone}
              onValueChange={(value) => updateField("timezone", value ?? "")}
            >
              <SelectTrigger id="gor-timezone" className="w-full">
                <SelectValue placeholder="Pilih zona waktu" />
              </SelectTrigger>
              <SelectContent>
                {GOR_TIMEZONE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      {success ? (
        <p
          className="text-sm text-emerald-600 dark:text-emerald-400"
          role="status"
        >
          {success}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan Profil"}
        </Button>
      </div>
    </form>
  );
}
