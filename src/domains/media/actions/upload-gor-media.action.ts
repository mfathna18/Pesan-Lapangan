"use server";

import { getGorMediaService } from "@/domains/media/actions/get-gor-media-service";
import { MEDIA_KIND } from "@/domains/media/constants";
import {
  MediaAuthorizationError,
  MediaStorageError,
  MediaValidationError,
} from "@/domains/media/errors";
import { getUploadFileFromFormData } from "@/domains/media/utils/form-data-file";
import { revalidatePublicVenueForUserId } from "@/domains/owner/utils/revalidate-owner-venue";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/owner/actions/types";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import {
  createKnownActionError,
  handleServerActionError,
} from "@/lib/server/actions";

const knownMediaErrors = [
  createKnownActionError(MediaValidationError),
  createKnownActionError(MediaStorageError),
  createKnownActionError(MediaAuthorizationError),
];

export async function uploadGorLogoAction(
  formData: FormData,
): Promise<ActionResponse<{ logoUrl: string }>> {
  const session = await requireOwnerSession();
  const file = getUploadFileFromFormData(formData);

  if (!file) {
    return actionFailure("Pilih gambar logo terlebih dahulu.");
  }

  try {
    const logoUrl = await getGorMediaService().uploadLogo(
      session.user.id,
      file,
    );

    await revalidatePublicVenueForUserId(session.user.id);

    return actionSuccess({ logoUrl });
  } catch (error) {
    return handleServerActionError("uploadGorLogoAction", error, {
      fallbackMessage: "Gagal mengunggah logo.",
      knownErrors: knownMediaErrors,
    });
  }
}

export async function uploadGorQrisAction(
  formData: FormData,
): Promise<ActionResponse<{ qrisImageUrl: string }>> {
  const session = await requireOwnerSession();
  const file = getUploadFileFromFormData(formData);

  if (!file) {
    return actionFailure("Pilih gambar QRIS terlebih dahulu.");
  }

  try {
    const qrisImageUrl = await getGorMediaService().uploadQris(
      session.user.id,
      file,
    );

    await revalidatePublicVenueForUserId(session.user.id);

    return actionSuccess({ qrisImageUrl });
  } catch (error) {
    return handleServerActionError("uploadGorQrisAction", error, {
      fallbackMessage: "Gagal mengunggah QRIS.",
      knownErrors: knownMediaErrors,
    });
  }
}

export async function uploadGorCoverAction(
  formData: FormData,
): Promise<ActionResponse<{ coverImages: string[] }>> {
  const session = await requireOwnerSession();
  const file = getUploadFileFromFormData(formData);

  if (!file) {
    return actionFailure("Pilih foto sampul terlebih dahulu.");
  }

  try {
    const coverImages = await getGorMediaService().addCover(
      session.user.id,
      file,
    );

    await revalidatePublicVenueForUserId(session.user.id);

    return actionSuccess({ coverImages });
  } catch (error) {
    return handleServerActionError("uploadGorCoverAction", error, {
      fallbackMessage: "Gagal mengunggah foto sampul.",
      knownErrors: knownMediaErrors,
    });
  }
}

export async function replaceGorCoverAction(
  formData: FormData,
): Promise<ActionResponse<{ coverImages: string[] }>> {
  const session = await requireOwnerSession();
  const file = getUploadFileFromFormData(formData);
  const indexValue = formData.get("index");

  if (!file) {
    return actionFailure("Pilih foto sampul terlebih dahulu.");
  }

  const index = Number(indexValue);

  if (!Number.isInteger(index) || index < 0) {
    return actionFailure("Foto sampul tidak valid.");
  }

  try {
    const coverImages = await getGorMediaService().replaceCover(
      session.user.id,
      file,
      index,
    );

    await revalidatePublicVenueForUserId(session.user.id);

    return actionSuccess({ coverImages });
  } catch (error) {
    return handleServerActionError("replaceGorCoverAction", error, {
      fallbackMessage: "Gagal mengganti foto sampul.",
      knownErrors: knownMediaErrors,
    });
  }
}

export async function deleteGorCoverAction(
  publicUrl: string,
): Promise<ActionResponse<{ coverImages: string[] }>> {
  const session = await requireOwnerSession();

  try {
    const coverImages = await getGorMediaService().deleteCover(
      session.user.id,
      publicUrl,
    );

    await revalidatePublicVenueForUserId(session.user.id);

    return actionSuccess({ coverImages });
  } catch (error) {
    return handleServerActionError("deleteGorCoverAction", error, {
      fallbackMessage: "Gagal menghapus foto sampul.",
      knownErrors: knownMediaErrors,
    });
  }
}

export async function reorderGorCoversAction(
  coverImages: string[],
): Promise<ActionResponse<{ coverImages: string[] }>> {
  const session = await requireOwnerSession();

  try {
    const reordered = await getGorMediaService().reorderCovers(
      session.user.id,
      coverImages,
    );

    await revalidatePublicVenueForUserId(session.user.id);

    return actionSuccess({ coverImages: reordered });
  } catch (error) {
    return handleServerActionError("reorderGorCoversAction", error, {
      fallbackMessage: "Gagal mengatur ulang foto sampul.",
      knownErrors: knownMediaErrors,
    });
  }
}

export async function uploadGorMediaAction(
  formData: FormData,
): Promise<
  ActionResponse<
    | { kind: typeof MEDIA_KIND.LOGO; logoUrl: string }
    | { kind: typeof MEDIA_KIND.QRIS; qrisImageUrl: string }
    | { kind: typeof MEDIA_KIND.COVER; coverImages: string[] }
  >
> {
  const kind = formData.get("kind");

  if (kind === MEDIA_KIND.LOGO) {
    const result = await uploadGorLogoAction(formData);

    if (!result.success) {
      return result;
    }

    return actionSuccess({
      kind: MEDIA_KIND.LOGO,
      logoUrl: result.data.logoUrl,
    });
  }

  if (kind === MEDIA_KIND.QRIS) {
    const result = await uploadGorQrisAction(formData);

    if (!result.success) {
      return result;
    }

    return actionSuccess({
      kind: MEDIA_KIND.QRIS,
      qrisImageUrl: result.data.qrisImageUrl,
    });
  }

  if (kind === MEDIA_KIND.COVER) {
    const replaceIndex = formData.get("replaceIndex");
    const result =
      replaceIndex != null && replaceIndex !== ""
        ? await replaceGorCoverAction(formData)
        : await uploadGorCoverAction(formData);

    if (!result.success) {
      return result;
    }

    return actionSuccess({
      kind: MEDIA_KIND.COVER,
      coverImages: result.data.coverImages,
    });
  }

  return actionFailure("Jenis media tidak valid.");
}
