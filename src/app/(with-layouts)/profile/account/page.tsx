"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { TextField } from "@/components/tailgrids/core/text-field";
import { ApiError } from "@/lib/api-client";
import { fetchActiveDivisions, fetchActiveUserTypes, fetchUserProfile, updateUserProfile } from "@/lib/users";
import { DivisionOffice, UserProfile, UserType } from "@/utils/mindaras-api-types";
import { useEffect, useState } from "react";
import { FieldError, Form } from "react-aria-components";
import { toast } from "sonner";

// TODO: replace with the real authenticated user's id once auth is wired up
const CURRENT_USER_ID = "C035AF19-1469-4EC9-84C3-5E095B8602B0";

// TODO: derive from real auth/role once a role system exists — the task
// requires the User Type field to be visible only to Administrators, but
// there's no concept of "current user's role" anywhere in this app yet.
const CURRENT_USER_IS_ADMIN = true;

export default function AccountPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [divisions, setDivisions] = useState<DivisionOffice[]>([]);
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // form state
  const [emailAddress, setEmailAddress] = useState("");
  const [empName, setEmpName] = useState("");
  const [position, setPosition] = useState("");
  const [divisionOfficeId, setdivisionOfficeId] = useState("");
  const [userTypeId, setUserTypeId] = useState("");

  useEffect(() => {
    Promise.all([fetchUserProfile(CURRENT_USER_ID), fetchActiveDivisions(), fetchActiveUserTypes()])
      .then(([userProfile, divisionList, userTypeList]) => {
        setProfile(userProfile);
        setDivisions(divisionList);
        setUserTypes(userTypeList);

        setEmailAddress(userProfile.employee.emailAddress);
        setEmpName(userProfile.employee.empName);
        setPosition(userProfile.employee.position);
        setdivisionOfficeId(userProfile.employee.divisionOfficeId);
        setUserTypeId(userProfile.userTypeId);
      })
      .catch((err) => {
        setLoadError(err instanceof ApiError ? err.message : "Couldn't load your profile.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    try {
      await updateUserProfile(profile.userId, {
        userName: profile.userName, // unchanged — username stays read-only
        emailAddress,
        userTypeId: CURRENT_USER_IS_ADMIN ? userTypeId : profile.userTypeId, // non-admins can't change this
        employee: { empName, position, divisionOfficeId },
      });
      toast.success("Profile updated");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Couldn't save your changes.";
      toast.error("Save failed", { description: message });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <Card className="h-96 animate-pulse bg-background-gray-secondary_alt" />;
  }

  if (loadError || !profile) {
    return (
      <Card className="space-y-2 p-8 text-center">
        <p className="text-sm text-text-tertiary">{loadError ?? "Profile not found."}</p>
      </Card>
    );
  }

  console.log("current division id:", divisionOfficeId);
  console.log("fetched division ids:", divisions.map((d) => d.divisionOfficeId));

  return (
    <div className="space-y-6">
      <Card className="bg-transparent p-5">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl leading-7 font-semibold text-text-primary">Account Details</h2>
          <div className="flex gap-2">
            <Badge color={profile.isActive ? "success" : "gray"} size="sm">
              {profile.isActive ? "Active" : "Inactive"}
            </Badge>
            {profile.mustChangePasswordOnFirstLogin && (
              <Badge color="warning" size="sm">
                Must change password
              </Badge>
            )}
          </div>
        </div>

        <Form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextField className="w-full gap-2.5">
              <Label>Username</Label>
              <Input value={profile.userName} className="w-full" />
            </TextField>

            <TextField className="w-full gap-2.5">
              <Label>Email address</Label>
              <Input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="w-full"
                required
              />
              <FieldError />
            </TextField>

            <TextField className="w-full gap-2.5">
              <Label>Full Name</Label>
              <Input
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
                className="w-full"
                required
              />
              <FieldError />
            </TextField>

            <TextField className="w-full gap-2.5">
              <Label>Position</Label>
              <Input
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full"
              />
            </TextField>

            <div>
              <Select
                value={divisionOfficeId}
                onChange={(val) => setdivisionOfficeId(val as string)}
                className="h-full"
                aria-label="Division"
              >
                <SelectLabel>Division</SelectLabel>
                <SelectTrigger className="h-full w-full border-input-border">
                  <SelectValue />
                  <SelectIndicator />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((d) => (
                    <SelectItem key={d.divisionOfficeId} id={d.divisionOfficeId} textValue={d.divisionOfficeName}>
                      {d.divisionOfficeName} ({d.divisionfficeAbbrev})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {CURRENT_USER_IS_ADMIN && (
              <div>
                <Select
                  value={userTypeId}
                  onChange={(val) => setUserTypeId(val as string)}
                  className="h-full"
                  aria-label="User Type"
                >
                  <SelectLabel>User Type</SelectLabel>
                  <SelectTrigger className="h-full w-full border-input-border">
                    <SelectValue />
                    <SelectIndicator />
                  </SelectTrigger>
                  <SelectContent>
                    {userTypes.map((t) => (
                      <SelectItem key={t.userTypeId} id={t.userTypeId} textValue={t.userTypeDesc}>
                        {t.userTypeDesc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="col-span-1 flex items-center justify-end gap-3 md:col-span-2">
              <Button variant="primary" size="lg" type="submit" className="px-3.5 text-sm" isDisabled={isSaving}>
                {isSaving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
}