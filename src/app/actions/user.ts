"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export interface UserProfileData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  title: string | null;
  specialty: string | null;
  department: string | null;
  hospital: string | null;
  phone: string | null;
  licenseNumber: string | null;
  bio: string | null;
  patientsCount: number;
  createdAt: Date;
}

export interface UpdateUserProfileInput {
  name?: string;
  image?: string;
  title?: string;
  specialty?: string;
  department?: string;
  hospital?: string;
  phone?: string;
  licenseNumber?: string;
  bio?: string;
}

export async function getUserProfile(): Promise<UserProfileData | null> {
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      _count: {
        select: { patients: true }
      }
    }
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    title: user.title,
    specialty: user.specialty,
    department: user.department,
    hospital: user.hospital,
    phone: user.phone,
    licenseNumber: user.licenseNumber,
    bio: user.bio,
    patientsCount: user._count.patients,
    createdAt: user.createdAt,
  };
}

export async function updateUserProfile(data: UpdateUserProfileInput) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized. Please log in to update your profile.");
  }

  const updatedUser = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      name: data.name !== undefined ? data.name.trim() : undefined,
      image: data.image !== undefined ? data.image.trim() : undefined,
      title: data.title !== undefined ? data.title.trim() : undefined,
      specialty: data.specialty !== undefined ? data.specialty.trim() : undefined,
      department: data.department !== undefined ? data.department.trim() : undefined,
      hospital: data.hospital !== undefined ? data.hospital.trim() : undefined,
      phone: data.phone !== undefined ? data.phone.trim() : undefined,
      licenseNumber: data.licenseNumber !== undefined ? data.licenseNumber.trim() : undefined,
      bio: data.bio !== undefined ? data.bio.trim() : undefined,
    },
    include: {
      _count: {
        select: { patients: true }
      }
    }
  });

  // Log audit action for HIPAA compliance (§ 164.312(b))
  try {
    await prisma.auditLog.create({
      data: {
        userId: updatedUser.id,
        userEmail: updatedUser.email || "unknown",
        patientId: 0,
        action: "VIEW_RECORD",
        resourceType: "User",
        resourceId: updatedUser.id,
        details: `Clinician profile updated: ${updatedUser.name} (${updatedUser.title || "Physician"})`,
        ipAddress: "127.0.0.1",
        userAgent: "MedIntel Profile Manager",
      }
    });
  } catch (err) {
    console.error("Failed to log audit event for profile update:", err);
  }

  return {
    success: true,
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
      title: updatedUser.title,
      specialty: updatedUser.specialty,
      department: updatedUser.department,
      hospital: updatedUser.hospital,
      phone: updatedUser.phone,
      licenseNumber: updatedUser.licenseNumber,
      bio: updatedUser.bio,
      patientsCount: updatedUser._count.patients,
      createdAt: updatedUser.createdAt,
    }
  };
}
