import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  public type FormField = {
    fieldLabel : Text; // Changed from label to fieldLabel
    fieldType : Text; // "text", "number", "date", "select"
    required : Bool;
    options : ?[Text];
  };

  public type RegistrationForm = {
    fields : [FormField];
  };

  public type Member = {
    id : Nat;
    fullName : Text;
    email : Text;
    phoneNumber : Text;
    membershipType : Text;
    registrationDate : Int;
    status : Text;
    customFields : [(Text, Text)];
  };

  var nextMemberId = 1;
  var currentForm : ?RegistrationForm = null;

  let members = Map.empty<Nat, Member>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Form management - Admin only
  public shared ({ caller }) func uploadForm(form : RegistrationForm) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can upload forms");
    };
    currentForm := ?form;
  };

  // Public access - anyone can view the form to register
  public query ({ caller }) func getCurrentForm() : async ?RegistrationForm {
    currentForm;
  };

  // Public access - anyone can register as a member
  public shared ({ caller }) func registerMember(fullName : Text, email : Text, phoneNumber : Text, membershipType : Text, customFields : [(Text, Text)]) : async Nat {
    let member : Member = {
      id = nextMemberId;
      fullName;
      email;
      phoneNumber;
      membershipType;
      registrationDate = Time.now();
      status = "active";
      customFields;
    };

    members.add(nextMemberId, member);
    nextMemberId += 1;
    member.id;
  };

  // Admin only - member data is sensitive
  public query ({ caller }) func getAllMembers() : async [Member] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all members");
    };
    members.values().toArray();
  };
};
