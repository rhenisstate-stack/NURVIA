"use client";

import * as React from "react";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/shared/avatar/UserAvatar";
import { useAuth } from "@/components/auth/auth-provider";
import { nurviaApi } from "@/lib/api-client";
import { ApiResponse } from "@/lib/api-types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const [profile, setProfile] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    firstName: "",
    middleName: "",
    lastName: "",
    displayName: "",
    biography: "",
    phoneNumber: "",
    country: "",
    city: "",
    professionalTitle: "",
    organization: ""
  });
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  React.useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const response = await nurviaApi.getProfile();
        if (response.success && response.data) {
          setProfile(response.data);
          setFormData({
            firstName: response.data.firstName || "",
            middleName: response.data.middleName || "",
            lastName: response.data.lastName || "",
            displayName: response.data.displayName || "",
            biography: response.data.biography || "",
            phoneNumber: response.data.phoneNumber || "",
            country: response.data.country || "",
            city: response.data.city || "",
            professionalTitle: response.data.professionalTitle || "",
            organization: response.data.organization || ""
          });
        } else {
          setError("Failed to load profile data");
        }
      } catch (err) {
        setError("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);
    setError(null);

    try {
      const response = await nurviaApi.updateProfileDetails({
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        displayName: formData.displayName,
        biography: formData.biography,
        phoneNumber: formData.phoneNumber,
        country: formData.country,
        city: formData.city,
        professionalTitle: formData.professionalTitle,
        organization: formData.organization
      });

      if (response.success && response.data) {
        setProfile(response.data.profile);
        setMessage("Profile updated successfully!");
        // Refresh auth context to update user data
        await refresh();
      } else {
        setError(response.message || "Failed to update profile");
      }
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile || !user) return;
    
    setIsUploading(true);
    setMessage(null);
    setError(null);
    
    try {
      const response = await nurviaApi.uploadAvatar(avatarFile);
      if (response.success && response.data) {
        setMessage("Avatar uploaded successfully!");
        // Update profile with new avatar info
        setProfile(prev => ({
          ...prev,
          avatarStorageKey: response.data.storageKey
        }));
      } else {
        setError(response.message || "Failed to upload avatar");
      }
    } catch (err) {
      setError("Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    
    setIsUploading(true);
    setMessage(null);
    setError(null);
    
    try {
      const response = await nurviaApi.removeAvatar();
      if (response.success) {
        setMessage("Avatar removed successfully!");
        // Update profile to remove avatar info
        setProfile(prev => ({
          ...prev,
          avatarStorageKey: null
        }));
      } else {
        setError(response.message || "Failed to remove avatar");
      }
    } catch (err) {
      setError("Failed to remove avatar");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <LearnerShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </LearnerShell>
    );
  }

  return (
    <LearnerShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-1">
          <h1 className="font-brand text-2xl font-bold text-foreground sm:text-3xl">My Profile</h1>
          <p className="text-sm text-foreground-secondary">Manage your personal profile information and avatar.</p>
        </div>

        {message && (
          <Alert variant="default">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info Section */}
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Personal Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      maxLength={100}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input
                      id="middleName"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      maxLength={100}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      maxLength={100}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="displayName">Display Name *</Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      required
                      maxLength={200}
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="biography">Biography</Label>
                  <Textarea
                    id="biography"
                    name="biography"
                    value={formData.biography}
                    onChange={handleChange}
                    maxLength={2000}
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      maxLength={20}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      maxLength={100}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      maxLength={100}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="professionalTitle">Professional Title</Label>
                    <Input
                      id="professionalTitle"
                      name="professionalTitle"
                      value={formData.professionalTitle}
                      onChange={handleChange}
                      maxLength={200}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      maxLength={200}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" isLoading={isUpdating} disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </section>
          </div>
          
          {/* Avatar Section */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Profile Photo</h2>
              
              <div className="flex flex-col items-center space-y-4">
                <UserAvatar 
                  name={formData.displayName || user?.name} 
                  avatarUrl={profile?.avatarStorageKey ? `/api/avatar/${profile.avatarStorageKey}` : null}
                  size="lg"
                />
                
                <div className="w-full space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? "Uploading..." : "Upload Photo"}
                    </Button>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    
                    {profile?.avatarStorageKey && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={handleRemoveAvatar}
                        disabled={isUploading}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  {avatarPreview && (
                    <div className="mt-2">
                      <p className="text-sm text-foreground-secondary mb-2">Preview:</p>
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="w-24 h-24 rounded-full object-cover border border-border"
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-center">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={handleUploadAvatar}
                      disabled={!avatarFile || isUploading}
                      className="w-full"
                    >
                      {isUploading ? "Saving..." : "Save Avatar"}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-foreground-muted">
                    JPG, PNG, or WebP. Maximum file size 5MB.
                  </p>
                </div>
              </div>
            </section>
            
            {/* Profile Summary */}
            <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Profile Summary</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-foreground-secondary">Name</p>
                  <p className="font-medium">{profile?.displayName || user?.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-foreground-secondary">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-foreground-secondary">Role</p>
                  <p className="font-medium">{user?.role}</p>
                </div>
                
                <div>
                  <p className="text-sm text-foreground-secondary">Member Since</p>
                  <p className="font-medium">January 2024</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}