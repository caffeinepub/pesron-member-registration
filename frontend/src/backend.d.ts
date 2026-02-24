import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Member {
    id: bigint;
    status: string;
    fullName: string;
    email: string;
    customFields: Array<[string, string]>;
    registrationDate: bigint;
    phoneNumber: string;
    membershipType: string;
}
export interface FormField {
    fieldLabel: string;
    required: boolean;
    options?: Array<string>;
    fieldType: string;
}
export interface UserProfile {
    name: string;
}
export interface RegistrationForm {
    fields: Array<FormField>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllMembers(): Promise<Array<Member>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentForm(): Promise<RegistrationForm | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerMember(fullName: string, email: string, phoneNumber: string, membershipType: string, customFields: Array<[string, string]>): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    uploadForm(form: RegistrationForm): Promise<void>;
}
