"use client";

import type * as React from "react";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  Apple,
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Plus,
  Send,
  Sparkles,
  User,
  Users,
  X
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Role = "Admin" | "Team Member";

type Invite = {
  id: number;
  email: string;
  role: Role;
};

type Screen =
  | "landing"
  | "signup"
  | "login"
  | "accountExists"
  | "verifyEmail"
  | "createWorkspace"
  | "nameCheck"
  | "duplicateName"
  | "workspaceFailed"
  | "configureWorkspace"
  | "inviteEmpty"
  | "inviteList"
  | "inviteError"
  | "inviteSent"
  | "expiredInvite"
  | "wrongAccount"
  | "readyChecklist"
  | "firstTime"
  | "loading"
  | "emptyActivity";

const screens: { id: Screen; label: string }[] = [
  { id: "landing", label: "Landing" },
  { id: "signup", label: "Sign up" },
  { id: "login", label: "Login" },
  { id: "createWorkspace", label: "Create workspace" },
  { id: "configureWorkspace", label: "Configure workspace" },
  { id: "inviteEmpty", label: "Invite empty" },
  { id: "inviteList", label: "Invite list" },
  { id: "readyChecklist", label: "Ready checklist" },
  { id: "firstTime", label: "First-time state" },
  { id: "accountExists", label: "Account exists" },
  { id: "duplicateName", label: "Duplicate name" },
  { id: "workspaceFailed", label: "Workspace failed" },
  { id: "inviteError", label: "Invite error" },
  { id: "inviteSent", label: "Invite sent" },
  { id: "expiredInvite", label: "Expired invite" },
  { id: "wrongAccount", label: "Wrong account" },
  { id: "loading", label: "Loading skeleton" },
  { id: "emptyActivity", label: "Empty activity" }
];

const steps = ["Workspace creation", "Configuration", "Invite teammates"];

const initialInvites: Invite[] = [
  { id: 1, email: "jema@pearsonsinc.com", role: "Admin" },
  { id: 2, email: "ara@pearsonsinc.com", role: "Team Member" },
  { id: 3, email: "aly@pearsonsinc.com", role: "Team Member" }
];

export default function PrototypePage() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [workspaceName, setWorkspaceName] = useState("SmartTech Inc.");
  const [slug, setSlug] = useState("smartech-inc");
  const [workType, setWorkType] = useState("Product Development");
  const [access, setAccess] = useState("Private");
  const [notifications, setNotifications] = useState(true);
  const [features, setFeatures] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Admin");
  const [invites, setInvites] = useState<Invite[]>([]);
  const [copied, setCopied] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const currentStep = useMemo(() => {
    if (["createWorkspace", "nameCheck", "duplicateName", "workspaceFailed"].includes(screen)) return 1;
    if (screen === "configureWorkspace") return 2;
    if (["inviteEmpty", "inviteList", "inviteError", "inviteSent", "readyChecklist"].includes(screen)) return 3;
    return 0;
  }, [screen]);

  function go(next: Screen) {
    setCopied(false);
    setScreen(next);
  }

  function submitWorkspace() {
    go("nameCheck");
    window.setTimeout(() => {
      const name = workspaceName.toLowerCase();
      if (name.includes("duplicate")) go("duplicateName");
      else if (name.includes("fail")) go("workspaceFailed");
      else go("configureWorkspace");
    }, 850);
  }

  function addInvite() {
    if (!email.trim()) return;
    setInvites((items) => [
      ...items,
      { id: Date.now(), email: email.trim(), role }
    ]);
    setEmail("");
    go("inviteList");
  }

  function sendInvites() {
    if (invites.some((invite) => invite.email.includes("bad"))) {
      go("inviteError");
      return;
    }
    go("inviteSent");
  }

  function toggleFeature(feature: string) {
    setFeatures((items) =>
      items.includes(feature)
        ? items.filter((item) => item !== feature)
        : [...items, feature]
    );
  }

  return (
    <main className="min-h-screen bg-foreground text-foreground">
      <div className="mx-auto flex min-h-screen max-w-5xl items-start justify-center">
        <MobileCanvas>
          {screen === "landing" ? (
            <LandingScreen onLogin={() => go("login")} onSignup={() => go("signup")} />
          ) : null}
          {screen === "signup" ? (
            <SignupScreen
              email={email}
              setEmail={setEmail}
              passwordVisible={passwordVisible}
              setPasswordVisible={setPasswordVisible}
              onCreate={() => {
                if (email.includes("existing")) go("accountExists");
                else go("verifyEmail");
              }}
              onLogin={() => go("login")}
            />
          ) : null}
          {screen === "login" ? (
            <LoginScreen
              passwordVisible={passwordVisible}
              setPasswordVisible={setPasswordVisible}
              onLogin={() => go("createWorkspace")}
              onSignup={() => go("signup")}
            />
          ) : null}
          {screen === "accountExists" ? (
            <MessageScreen
              tone="warning"
              title="Account already exists"
              description="Use Log in to access your existing workspace account."
              action="Log in"
              onAction={() => go("login")}
            />
          ) : null}
          {screen === "verifyEmail" ? (
            <MessageScreen
              icon={<Mail />}
              title="Verify your email"
              description="We sent a verification link to your inbox."
              action="Continue"
              onAction={() => go("createWorkspace")}
            />
          ) : null}
          {screen === "createWorkspace" ? (
            <WorkspaceScreen
              step={currentStep}
              workspaceName={workspaceName}
              setWorkspaceName={setWorkspaceName}
              slug={slug}
              setSlug={setSlug}
              workType={workType}
              setWorkType={setWorkType}
              onNext={submitWorkspace}
              onSkip={() => go("configureWorkspace")}
            />
          ) : null}
          {screen === "nameCheck" ? (
            <LoadingScreen title="Checking workspace name" />
          ) : null}
          {screen === "duplicateName" ? (
            <WorkspaceScreen
              step={1}
              workspaceName={workspaceName}
              setWorkspaceName={setWorkspaceName}
              slug={slug}
              setSlug={setSlug}
              workType={workType}
              setWorkType={setWorkType}
              error="This workspace name is already taken."
              onNext={submitWorkspace}
              onSkip={() => go("configureWorkspace")}
            />
          ) : null}
          {screen === "workspaceFailed" ? (
            <MessageScreen
              tone="destructive"
              title="Workspace setup failed"
              description="We could not save the workspace. Please retry."
              action="Retry setup"
              onAction={submitWorkspace}
            />
          ) : null}
          {screen === "configureWorkspace" ? (
            <ConfigureScreen
              step={currentStep}
              access={access}
              setAccess={setAccess}
              notifications={notifications}
              setNotifications={setNotifications}
              features={features}
              toggleFeature={toggleFeature}
              onNext={() => go("inviteEmpty")}
              onSkip={() => go("inviteEmpty")}
            />
          ) : null}
          {screen === "inviteEmpty" ? (
            <InviteScreen
              step={currentStep}
              email={email}
              setEmail={setEmail}
              role={role}
              setRole={setRole}
              copied={copied}
              setCopied={setCopied}
              onAdd={addInvite}
              onNext={() => go("readyChecklist")}
              onSkip={() => go("readyChecklist")}
            />
          ) : null}
          {screen === "inviteList" ? (
            <InviteListScreen
              step={currentStep}
              email={email}
              setEmail={setEmail}
              role={role}
              setRole={setRole}
              invites={invites}
              setInvites={setInvites}
              onAdd={addInvite}
              onSend={sendInvites}
              onSkip={() => go("readyChecklist")}
            />
          ) : null}
          {screen === "inviteError" ? (
            <InviteListScreen
              step={3}
              email={email}
              setEmail={setEmail}
              role={role}
              setRole={setRole}
              invites={invites}
              setInvites={setInvites}
              error="One or more invite emails could not be sent."
              onAdd={addInvite}
              onSend={sendInvites}
              onSkip={() => go("readyChecklist")}
            />
          ) : null}
          {screen === "inviteSent" ? (
            <MessageScreen
              tone="success"
              title="Invites sent"
              description="Your teammates will receive a secure invite link."
              action="View checklist"
              onAction={() => go("readyChecklist")}
            />
          ) : null}
          {screen === "expiredInvite" ? (
            <MessageScreen
              tone="destructive"
              title="Invite link expired"
              description="Ask an Admin to send a new invitation."
              action="Back to login"
              onAction={() => go("login")}
            />
          ) : null}
          {screen === "wrongAccount" ? (
            <MessageScreen
              tone="warning"
              title="Wrong account"
              description="Use the email address that received this workspace invite."
              action="Switch account"
              onAction={() => go("login")}
            />
          ) : null}
          {screen === "readyChecklist" ? (
            <ChecklistScreen onOpen={() => go("firstTime")} />
          ) : null}
          {screen === "firstTime" ? (
            <WorkspaceReadyScreen onInvite={() => go("inviteEmpty")} />
          ) : null}
          {screen === "loading" ? <SkeletonScreen /> : null}
          {screen === "emptyActivity" ? (
            <EmptyActivityScreen onChecklist={() => go("readyChecklist")} />
          ) : null}
        </MobileCanvas>
      </div>
    </main>
  );
}

function MobileCanvas({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-screen w-full max-w-[375px] overflow-hidden bg-muted shadow-2xl sm:min-h-[900px]">
      {children}
    </section>
  );
}

function LaunchpadLogo({ size = "large" }: { size?: "large" | "small" }) {
  return (
    <div
      className={cn(
        "mx-auto flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_10px_18px_hsl(var(--primary)/0.28)]",
        size === "large" ? "h-[100px] w-[100px]" : "h-14 w-14"
      )}
    >
      <Sparkles className={cn(size === "large" ? "h-12 w-12" : "h-7 w-7")} />
    </div>
  );
}

function LandingScreen({
  onLogin,
  onSignup
}: {
  onLogin: () => void;
  onSignup: () => void;
}) {
  return (
    <div className="flex min-h-[900px] flex-col items-center bg-muted px-[51px] pt-[294px]">
      <LaunchpadLogo />
      <div className="mt-6 text-center">
        <h1 className="text-[36px] font-semibold leading-10 tracking-normal">
          Launchpad
        </h1>
        <p className="mt-3 text-lg leading-7 text-muted-foreground">
          Welcome to Launchpad
        </p>
      </div>
      <div className="mt-10 w-full space-y-3">
        <Button className="h-10 w-full" onClick={onLogin}>
          Log in
        </Button>
        <Button className="h-10 w-full" variant="outline" onClick={onSignup}>
          Sign up
        </Button>
      </div>
    </div>
  );
}

function LoginScreen({
  passwordVisible,
  setPasswordVisible,
  onLogin,
  onSignup
}: {
  passwordVisible: boolean;
  setPasswordVisible: (value: boolean) => void;
  onLogin: () => void;
  onSignup: () => void;
}) {
  return (
    <div className="min-h-[856px] bg-muted px-4 pt-[91px]">
      <LaunchpadLogo size="small" />
      <ScreenHeading
        className="mt-5"
        title="Welcome back"
        description="Log in to your workspace"
      />
      <FormPanel className="mt-7 min-h-[526px]">
        <Field label="Email address" id="login-email">
          <IconInput id="login-email" icon={<Mail />} placeholder="you@company.com" />
        </Field>
        <Field label="Password" id="login-password">
          <IconInput
            id="login-password"
            icon={<Lock />}
            type={passwordVisible ? "text" : "password"}
            placeholder="Enter your password"
            trailing={
              <button
                type="button"
                aria-label={passwordVisible ? "Hide password" : "Show password"}
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
        </Field>
        <label className="flex items-center gap-3 text-sm leading-5 text-muted-foreground">
          <Checkbox aria-label="Remember me" />
          <span>Remember me for 30 days</span>
        </label>
        <Button className="h-10 w-full" onClick={onLogin}>
          Log in
        </Button>
        <Button variant="link" className="mx-auto h-5 px-0">
          Forgot password?
        </Button>
        <SocialDivider />
        <div className="grid grid-cols-2 gap-3">
          <Button className="h-10" variant="outline">
            Google
          </Button>
          <Button className="h-10" variant="outline">
            <Apple />
            Apple
          </Button>
        </div>
        <p className="pt-3 text-center text-sm text-muted-foreground">
          Do not have an account?{" "}
          <button className="font-medium text-primary" onClick={onSignup}>
            Sign up
          </button>
        </p>
      </FormPanel>
    </div>
  );
}

function SignupScreen({
  email,
  setEmail,
  passwordVisible,
  setPasswordVisible,
  onCreate,
  onLogin
}: {
  email: string;
  setEmail: (value: string) => void;
  passwordVisible: boolean;
  setPasswordVisible: (value: boolean) => void;
  onCreate: () => void;
  onLogin: () => void;
}) {
  return (
    <div className="min-h-[900px] bg-muted px-4 pt-[50px]">
      <ScreenHeading
        title="Create your account"
        description="Start collaborating with your team today"
      />
      <FormPanel className="mt-8 min-h-[684px]">
        <Field label="Full name" id="name">
          <IconInput id="name" icon={<User />} placeholder="John Doe" />
        </Field>
        <Field label="Email address" id="email">
          <IconInput
            id="email"
            icon={<Mail />}
            value={email}
            placeholder="you@company.com"
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field label="Password" id="password">
          <IconInput
            id="password"
            icon={<Lock />}
            type={passwordVisible ? "text" : "password"}
            placeholder="Create a strong password"
            trailing={
              <button
                type="button"
                aria-label={passwordVisible ? "Hide password" : "Show password"}
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
        </Field>
        <Field label="Confirm password" id="confirm">
          <IconInput id="confirm" icon={<Lock />} type="password" placeholder="Confirm your password" />
        </Field>
        <label className="flex items-center gap-3 text-sm font-medium leading-5">
          <Checkbox aria-label="Accept terms and conditions" />
          <span>Accept terms and conditions</span>
        </label>
        <Button className="h-10 w-full" onClick={onCreate}>
          Create account
        </Button>
        <SocialDivider />
        <div className="grid grid-cols-2 gap-3">
          <Button className="h-10" variant="outline">
            Google
          </Button>
          <Button className="h-10" variant="outline">
            <Apple />
            Apple
          </Button>
        </div>
        <p className="pt-3 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button className="font-medium text-primary" onClick={onLogin}>
            Log in
          </button>
        </p>
      </FormPanel>
    </div>
  );
}

function WorkspaceScreen({
  step,
  workspaceName,
  setWorkspaceName,
  slug,
  setSlug,
  workType,
  setWorkType,
  error,
  onNext,
  onSkip
}: {
  step: number;
  workspaceName: string;
  setWorkspaceName: (value: string) => void;
  slug: string;
  setSlug: (value: string) => void;
  workType: string;
  setWorkType: (value: string) => void;
  error?: string;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <FlowScreen
      step={step}
      title="Create your workspace"
      description="Let's set up a space for your team to collaborate"
      onSkip={onSkip}
    >
      {error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Workspace name unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Field label="Workspace name" id="workspace-name">
        <Input
          id="workspace-name"
          className="h-9"
          value={workspaceName}
          placeholder="SmartTech Inc."
          onChange={(event) => setWorkspaceName(event.target.value)}
        />
      </Field>
      <Field label="Workspace URL" id="workspace-url">
        <div className="grid grid-cols-[123px_1fr] gap-2">
          <Input className="h-9" value="launchpad.app/" readOnly aria-label="Workspace URL prefix" />
          <Input
            id="workspace-url"
            className="h-9"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
          />
        </div>
      </Field>
      <Field label="Workspace type" id="workspace-type">
        <Select
          id="workspace-type"
          className="h-9"
          value={workType}
          onChange={(event) => setWorkType(event.target.value)}
        >
          <option>Product Development</option>
          <option>Marketing</option>
          <option>Engineering</option>
          <option>Operations</option>
          <option>Other</option>
        </Select>
      </Field>
      <ChoiceCard
        title="What will your team do here?"
        items={[
          ["Product Development", "Build and ship products"],
          ["Marketing", "Campaigns and content"],
          ["Engineering", "Software development"],
          ["Operations", "Business operations"],
          ["Other", "General collaboration"]
        ]}
        selected={workType}
        onSelect={setWorkType}
      />
      <PanelActions primary="Create workspace" onPrimary={onNext} secondary="Skip for now" onSecondary={onSkip} />
    </FlowScreen>
  );
}

function ConfigureScreen({
  step,
  access,
  setAccess,
  notifications,
  setNotifications,
  features,
  toggleFeature,
  onNext,
  onSkip
}: {
  step: number;
  access: string;
  setAccess: (value: string) => void;
  notifications: boolean;
  setNotifications: (value: boolean) => void;
  features: string[];
  toggleFeature: (value: string) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <FlowScreen
      step={step}
      title="Configure your workspace"
      description="Customize settings to match your team's needs"
      onSkip={onSkip}
    >
      <ChoiceCard
        title="Workspace visibility"
        items={[
          ["Private", "Only invited members can join"],
          ["Public", "Anyone with link can join"]
        ]}
        selected={access}
        onSelect={setAccess}
      />
      <Field label="Default timezone" id="access-policy">
        <Select
          id="access-policy"
          className="h-9"
          defaultValue=""
        >
          <option value="" disabled>Select a timezone</option>
          <option>Asia/Manila</option>
          <option>America/New_York</option>
          <option>Europe/London</option>
        </Select>
      </Field>
      <div className="flex h-6 items-center justify-between">
        <p className="text-sm font-medium">Notifications default</p>
        <Switch checked={notifications} onCheckedChange={setNotifications} />
      </div>
      <div className="space-y-2">
        <Label>Enable features (optional)</Label>
        {[
          ["Project Management", "Track tasks and deadlines"],
          ["Team Documentation", "Shared knowledge base"],
          ["Team Chat", "Real-time communication"],
          ["Shared Calendar", "Schedule and events"]
        ].map(([feature, description]) => (
          <button
            key={feature}
            type="button"
            className="flex h-[72px] w-full items-center gap-3 rounded-lg border bg-background p-4 text-left"
            onClick={() => toggleFeature(feature)}
          >
            <Checkbox checked={features.includes(feature)} aria-label={feature} />
            <div>
              <p className="text-sm font-medium">{feature}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </button>
        ))}
      </div>
      <PanelActions primary="Save settings" onPrimary={onNext} secondary="Skip for now" onSecondary={onSkip} />
    </FlowScreen>
  );
}

function InviteScreen({
  step,
  email,
  setEmail,
  role,
  setRole,
  copied,
  setCopied,
  onAdd,
  onNext,
  onSkip
}: {
  step: number;
  email: string;
  setEmail: (value: string) => void;
  role: Role;
  setRole: (value: Role) => void;
  copied: boolean;
  setCopied: (value: boolean) => void;
  onAdd: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <FlowScreen
      step={step}
      title="Invite your teammates"
      description="Collaboration is better together. Invite your team to join."
      onSkip={onSkip}
    >
      <ChoiceCard
        title="Select role"
        items={[
          ["Admin", ""],
          ["Team Member", ""]
        ]}
        selected={role}
        onSelect={(value) => setRole(value as Role)}
      />
      <EmailInviteField email={email} setEmail={setEmail} onAdd={onAdd} />
      <div className="flex h-28 flex-col items-center justify-center rounded-lg bg-secondary text-center">
        <Users className="h-6 w-6 text-primary" />
        <p className="mt-3 max-w-[220px] text-sm leading-5 text-muted-foreground">
          No invites yet. Add email addresses above to get started.
        </p>
      </div>
      <SocialDivider label="Or share invite link" />
      <div className="flex h-9 items-center gap-2 rounded-md border bg-background px-3 shadow-sm">
        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          launchpad.app/pearsons-inc
        </span>
        <button type="button" aria-label="Copy invite link" onClick={() => setCopied(true)}>
          <Copy className="h-4 w-4 text-muted-foreground" />
        </button>
        <span className="sr-only">{copied ? "Copied" : "Not copied"}</span>
      </div>
      <PanelActions primary="Send invites" onPrimary={onNext} secondary="Skip for now" onSecondary={onSkip} />
    </FlowScreen>
  );
}

function InviteListScreen({
  step,
  email,
  setEmail,
  role,
  setRole,
  invites,
  setInvites,
  error,
  onAdd,
  onSend,
  onSkip
}: {
  step: number;
  email: string;
  setEmail: (value: string) => void;
  role: Role;
  setRole: (value: Role) => void;
  invites: Invite[];
  setInvites: React.Dispatch<React.SetStateAction<Invite[]>>;
  error?: string;
  onAdd: () => void;
  onSend: () => void;
  onSkip: () => void;
}) {
  return (
    <FlowScreen
      step={step}
      title="Invite your teammates"
      description="Collaboration is better together. Invite your team to join."
      onSkip={onSkip}
      panelClassName="min-h-[852px]"
    >
      {error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Invite error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <ChoiceCard
        title="Select role"
        items={[
          ["Admin", ""],
          ["Team Member", ""]
        ]}
        selected={role}
        onSelect={(value) => setRole(value as Role)}
      />
      <EmailInviteField email={email} setEmail={setEmail} onAdd={onAdd} />
      <div className="rounded-lg bg-background p-4">
        <p className="text-sm font-medium">Invite list</p>
        <p className="text-xs text-muted-foreground">{invites.length}/20 invitations added</p>
        <div className="mt-4 space-y-2">
          {invites.map((invite) => (
            <div key={invite.id} className="flex h-[72px] items-center gap-3 rounded-md border bg-background px-2 shadow-sm">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{invite.email[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{invite.email}</p>
                <Badge variant={invite.role === "Admin" ? "default" : "secondary"} className="mt-1 h-6">
                  {invite.role}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${invite.email}`}
                onClick={() => setInvites((items) => items.filter((item) => item.id !== invite.id))}
              >
                <X />
              </Button>
            </div>
          ))}
        </div>
      </div>
      <SocialDivider label="Or share invite link" />
      <div className="flex h-9 items-center gap-2 rounded-md border bg-background px-3 shadow-sm">
        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          launchpad.app/pearsons-inc
        </span>
        <Copy className="h-4 w-4 text-muted-foreground" />
      </div>
      <PanelActions primary="Send invitations" onPrimary={onSend} secondary="Skip for now" onSecondary={onSkip} icon={<Send />} />
    </FlowScreen>
  );
}

function ChecklistScreen({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="min-h-[900px] bg-background px-4 pt-12">
      <TopTitle title="Pearsons Inc." />
      <div className="mt-10">
        <ScreenHeading
          align="left"
          title="Workspace ready"
          description="Complete setup items are ready for your team."
        />
        <div className="mt-8 rounded-2xl border bg-card p-7 shadow-sm">
          <p className="text-sm font-medium">Onboarding checklist</p>
          <div className="mt-4 space-y-3">
            {steps.map((step) => (
              <div key={step} className="flex items-center gap-3 rounded-lg border bg-background p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-success-foreground">
                  <Check className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium">{step}</span>
              </div>
            ))}
          </div>
          <Button className="mt-6 h-10 w-full" onClick={onOpen}>
            Open workspace
          </Button>
        </div>
      </div>
    </div>
  );
}

function WorkspaceReadyScreen({ onInvite }: { onInvite: () => void }) {
  return (
    <div className="min-h-[1482px] bg-background">
      <TopNav title="Pearsons Inc." />
      <div className="px-4 pt-10">
        <ScreenHeading
          align="left"
          title="Welcome to your workspace!"
          description="Your workspace is ready. Get started by creating your first project or inviting your team."
        />
        <div className="mt-8 space-y-7">
          <ActionCard icon={<Plus />} title="Create project" description="Start organizing your work" action="Create" />
          <ActionCard icon={<Users />} title="Invite Members" description="Invite your team to collaborate on this project." action="Invite" onAction={onInvite} />
          <div className="rounded-2xl border bg-card p-7 shadow-sm">
            <p className="text-sm font-medium">Widgets</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {["Total Revenue", "Projects", "Tasks", "Members"].map((item) => (
                <div key={item} className="rounded-lg border bg-background p-4">
                  <Badge variant="secondary" className="h-[22px]">+12.5%</Badge>
                  <p className="mt-2 text-lg font-semibold">$1,250.00</p>
                  <p className="text-xs text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-7 shadow-sm">
            <p className="text-sm font-medium">Teammates</p>
            <div className="mt-4 divide-y">
              {initialInvites.map((invite) => (
                <div key={invite.id} className="flex items-center gap-4 py-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{invite.email[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{invite.email.split("@")[0]}</p>
                    <p className="text-xs text-muted-foreground">{invite.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageScreen({
  title,
  description,
  action,
  onAction,
  tone = "default",
  icon
}: {
  title: string;
  description: string;
  action: string;
  onAction: () => void;
  tone?: "default" | "success" | "warning" | "destructive";
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[900px] flex-col items-center justify-center bg-background px-10 text-center">
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-md",
          tone === "success" && "bg-success text-success-foreground",
          tone === "warning" && "bg-warning text-warning-foreground",
          tone === "destructive" && "bg-destructive text-destructive-foreground",
          tone === "default" && "bg-primary text-primary-foreground"
        )}
      >
        {icon || (tone === "success" ? <Check /> : <AlertCircle />)}
      </div>
      <h1 className="mt-6 text-2xl font-medium leading-8">{title}</h1>
      <p className="mt-2 text-base leading-6 text-muted-foreground">{description}</p>
      <Button className="mt-8 h-10 w-full" onClick={onAction}>
        {action}
      </Button>
    </div>
  );
}

function LoadingScreen({ title }: { title: string }) {
  return (
    <div className="flex min-h-[900px] flex-col items-center justify-center bg-background px-10 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <h1 className="mt-5 text-2xl font-medium leading-8">{title}</h1>
      <p className="mt-2 text-base text-muted-foreground">This should only take a moment.</p>
    </div>
  );
}

function SkeletonScreen() {
  return (
    <div className="min-h-[900px] bg-background px-4 pt-12">
      <TopTitle title="Pearsons Inc." />
      <div className="mt-10 space-y-5">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <div className="rounded-2xl border bg-card p-7">
          <Skeleton className="h-5 w-24" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyActivityScreen({ onChecklist }: { onChecklist: () => void }) {
  return (
    <div className="min-h-[900px] bg-background">
      <TopNav title="Pearsons Inc." />
      <div className="px-4 pt-10">
        <ScreenHeading
          align="left"
          title="No activity yet"
          description="Workspace activity will appear after your team starts collaborating."
        />
        <div className="mt-8 rounded-2xl border bg-card p-7 text-center shadow-sm">
          <Users className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-sm font-medium">Invite teammates to begin</p>
          <Button className="mt-5 h-10 w-full" onClick={onChecklist}>
            View checklist
          </Button>
        </div>
      </div>
    </div>
  );
}

function FlowScreen({
  step,
  title,
  description,
  children,
  onSkip,
  panelClassName
}: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
  onSkip: () => void;
  panelClassName?: string;
}) {
  return (
    <div className="min-h-[1198px] bg-muted px-4 pt-11">
      <FlowNav onSkip={onSkip} />
      <ProgressSteps step={step} />
      <ScreenHeading className="mt-8" title={title} description={description} />
      <FormPanel className={cn("mt-8 min-h-[854px]", panelClassName)}>
        {children}
      </FormPanel>
    </div>
  );
}

function FlowNav({ onSkip }: { onSkip: () => void }) {
  return (
    <div className="flex h-9 items-center justify-between">
      <Button variant="ghost" className="h-8 px-2">
        <ArrowLeft />
        Back
      </Button>
      <Button variant="ghost" className="h-9 px-3" onClick={onSkip}>
        Skip
      </Button>
    </div>
  );
}

function ProgressSteps({ step }: { step: number }) {
  return (
    <div className="mt-8 flex h-9 items-center justify-between">
      {steps.map((item, index) => {
        const current = index + 1;
        const active = current <= step;
        return (
          <div key={item} className="flex flex-1 items-center">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md border text-xs font-medium shadow-sm",
                active ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
              )}
              aria-label={item}
            >
              {current < step ? <Check className="h-4 w-4" /> : current}
            </div>
            {index < steps.length - 1 ? <Separator className="mx-2 flex-1" /> : null}
          </div>
        );
      })}
    </div>
  );
}

function ScreenHeading({
  title,
  description,
  className,
  align = "center"
}: {
  title: string;
  description: string;
  className?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn(align === "center" ? "text-center" : "text-left", className)}>
      <h1 className="text-2xl font-medium leading-8 tracking-normal">{title}</h1>
      <p className="mt-2 text-base leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function FormPanel({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-[343px] rounded-2xl border bg-card p-7 shadow-sm", className)}>
      <div className="space-y-7">{children}</div>
    </div>
  );
}

function Field({
  label,
  id,
  children
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function IconInput({
  icon,
  trailing,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">
        {icon}
      </span>
      <Input className={cn("h-9 pl-9 pr-9", className)} {...props} />
      {trailing ? (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">
          {trailing}
        </span>
      ) : null}
    </div>
  );
}

function ChoiceCard({
  title,
  items,
  selected,
  onSelect
}: {
  title: string;
  items: [string, string][];
  selected: string;
  onSelect?: (value: string) => void;
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <p className="text-sm font-medium">{title}</p>
      <div className="mt-3 space-y-3">
        {items.map(([label, description]) => (
          <button
            key={label}
            type="button"
            className={cn(
              "flex min-h-[52px] w-full items-center gap-3 rounded-lg border bg-background p-4 text-left shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected === label && "border-primary bg-primary/5"
            )}
            onClick={() => onSelect?.(label)}
          >
            <div
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full border",
                selected === label && "border-primary"
              )}
            >
              {selected === label ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
            </div>
            <div>
              <p className="text-sm font-medium">{label}</p>
              {description ? (
                <p className="text-xs text-muted-foreground">{description}</p>
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function EmailInviteField({
  email,
  setEmail,
  onAdd
}: {
  email: string;
  setEmail: (value: string) => void;
  onAdd: () => void;
}) {
  return (
    <Field label="Invite teammate by email" id="invite-email">
      <div className="flex">
        <Input
          id="invite-email"
          className="h-9 rounded-r-none"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Button className="h-9 rounded-l-none px-3" onClick={onAdd} aria-label="Add invite">
          <Plus />
        </Button>
      </div>
    </Field>
  );
}

function PanelActions({
  primary,
  secondary,
  icon,
  onPrimary,
  onSecondary
}: {
  primary: string;
  secondary: string;
  icon?: React.ReactNode;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  return (
    <div className="space-y-3 pt-1">
      <Button className="h-10 w-full" onClick={onPrimary}>
        {icon}
        {primary}
      </Button>
      <Button className="mx-auto flex h-9" variant="ghost" onClick={onSecondary}>
        {secondary}
      </Button>
    </div>
  );
}

function SocialDivider({ label = "Or continue with" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Separator className="flex-1" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <Separator className="flex-1" />
    </div>
  );
}

function TopTitle({ title }: { title: string }) {
  return <h1 className="text-center text-lg font-medium leading-7">{title}</h1>;
}

function TopNav({ title }: { title: string }) {
  return (
    <div className="flex h-12 items-center justify-center border-b bg-background">
      <p className="text-lg font-medium">{title}</p>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  action,
  onAction
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex h-[156px] items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm">
      <Avatar className="h-10 w-10">
        <AvatarFallback>{icon}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Button className="h-8" variant="outline" onClick={onAction}>
        {action}
      </Button>
    </div>
  );
}
