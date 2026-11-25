const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const { test, before, after, beforeEach } = require("node:test");
const fs = require("node:fs");

let testEnv;
const PROJECT_ID = process.env.GCP_PROJECT || "demo-no-project";
const OWNER_UID = "owner_uid_001";
const OWNER_EMAIL = "gulfamahmadrajpoot@gmail.com";
const PLAYER_A_UID = "player_a_101";
const PLAYER_B_UID = "player_b_202";

const [emulatorHost, emulatorPortStr] = (process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8085").split(":");
const emulatorPort = parseInt(emulatorPortStr, 10);

function ownerDb() {
  return testEnv.authenticatedContext(OWNER_UID, {
    email: OWNER_EMAIL,
    email_verified: true,
  }).firestore();
}

function spoofedEmailDb() {
  return testEnv.authenticatedContext(PLAYER_A_UID, {
    email: OWNER_EMAIL,
    email_verified: false,
  }).firestore();
}

function playerDb(uid = PLAYER_A_UID) {
  return testEnv.authenticatedContext(uid, {
    email: `${uid}@example.com`,
    email_verified: true,
  }).firestore();
}

before(async () => {
  const rules = fs.readFileSync("./firestore.rules", "utf8");
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: emulatorHost,
      port: emulatorPort,
    },
  });
});

after(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
  }
});

test("Unauthenticated users cannot read or write any collection", async () => {
  const unauth = testEnv.unauthenticatedContext().firestore();
  await assertFails(unauth.collection("gameConfig").doc("published").get());
  await assertFails(unauth.collection("ownerConfig").doc("meta").get());
  await assertFails(unauth.collection("players").doc(PLAYER_A_UID).get());
  await assertFails(unauth.collection("players").get());
});

test("Spoofed unverified owner email is rejected from admin actions", async () => {
  const spoofed = spoofedEmailDb();
  const past = new Date(Date.now() - 1000);
  await assertFails(
    spoofed.collection("admins").doc(PLAYER_A_UID).set({
      uid: PLAYER_A_UID,
      role: "owner",
      createdAt: past,
    })
  );
  await assertFails(
    spoofed.collection("gameConfig").doc("published").set({
      configJson: "{\"version\":1}",
      version: 1,
      updatedBy: PLAYER_A_UID,
      updatedAt: past,
      publishedAt: past,
    })
  );
  await assertFails(spoofed.collection("players").get());
});

test("Verified owner can claim admin, publish gameConfig, and create backups", async () => {
  const admin = ownerDb();
  const past = new Date(Date.now() - 2000);

  await assertSucceeds(
    admin.collection("admins").doc(OWNER_UID).set({
      uid: OWNER_UID,
      role: "owner",
      createdAt: past,
    })
  );

  await assertSucceeds(
    admin.collection("ownerConfig").doc("meta").set({
      ownerUid: OWNER_UID,
      claimed: true,
      salt: "c2FsdF92YWx1ZV8xMjM0NTY=",
      passHash: "aGFzaF92YWx1ZV8xMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ=",
      updatedBy: OWNER_UID,
      updatedAt: past,
    })
  );

  await assertSucceeds(
    admin.collection("gameConfig").doc("published").set({
      configJson: "{\"rewardMultiplier\":1.5}",
      version: 1,
      updatedBy: OWNER_UID,
      publishedAt: past,
      updatedAt: past,
    })
  );

  await assertSucceeds(
    admin.collection("gameConfig").doc("published").collection("backups").doc("bk_1").set({
      label: "Before Patrol Update",
      configJson: "{\"rewardMultiplier\":1.5}",
      version: 1,
      createdBy: OWNER_UID,
      createdAt: past,
    })
  );

  await assertSucceeds(admin.collection("gameConfig").doc("published").collection("backups").get());
});

test("Regular players can read published gameConfig but cannot read draft, ownerConfig, or backups", async () => {
  const admin = ownerDb();
  const pA = playerDb(PLAYER_A_UID);
  const past = new Date(Date.now() - 2000);

  await assertSucceeds(
    admin.collection("gameConfig").doc("published").set({
      configJson: "{\"rewardMultiplier\":1.2}",
      version: 1,
      updatedBy: OWNER_UID,
      publishedAt: past,
      updatedAt: past,
    })
  );
  await assertSucceeds(
    admin.collection("gameConfig").doc("draft").set({
      configJson: "{\"rewardMultiplier\":2.0}",
      version: 2,
      updatedBy: OWNER_UID,
      updatedAt: past,
    })
  );

  await assertSucceeds(pA.collection("gameConfig").doc("published").get());
  await assertFails(pA.collection("gameConfig").doc("draft").get());
  await assertFails(pA.collection("ownerConfig").doc("meta").get());
  await assertFails(pA.collection("gameConfig").doc("published").collection("backups").get());
  await assertFails(
    pA.collection("gameConfig").doc("published").update({
      configJson: "{\"hacked\":true}",
      updatedBy: PLAYER_A_UID,
      updatedAt: new Date(Date.now() - 500),
    })
  );
});

test("Player account lifecycle: create own doc, partial update, cross-user & self-unban blocked, owner moderation allowed", async () => {
  const pA = playerDb(PLAYER_A_UID);
  const pB = playerDb(PLAYER_B_UID);
  const admin = ownerDb();
  const created = new Date(Date.now() - 5000);

  // Regular player creates own player doc (no @DocumentId id field, no banned=true)
  await assertSucceeds(
    pA.collection("players").doc(PLAYER_A_UID).set({
      userId: PLAYER_A_UID,
      displayName: "Alex Mercer",
      cash: 3200,
      xp: 0,
      level: 1,
      selectedCityId: "original",
      completedMissionsCount: 0,
      banned: false,
      resetRequested: false,
      createdAt: created,
      updatedAt: created,
    })
  );

  // Reject ghost field or extra id field
  await assertFails(
    pB.collection("players").doc(PLAYER_B_UID).set({
      id: PLAYER_B_UID,
      userId: PLAYER_B_UID,
      displayName: "Hacker",
      cash: 3200,
      xp: 0,
      level: 1,
      selectedCityId: "original",
      completedMissionsCount: 0,
      banned: false,
      resetRequested: false,
      createdAt: created,
      updatedAt: created,
    })
  );

  // Reject cross-user read, list, and update
  await assertFails(pB.collection("players").doc(PLAYER_A_UID).get());
  await assertFails(pB.collection("players").get());
  await assertFails(
    pB.collection("players").doc(PLAYER_A_UID).update({
      cash: 999999,
      updatedAt: new Date(Date.now() - 1000),
    })
  );

  // Player cannot tamper with createdAt or ban themselves
  await assertFails(
    pA.collection("players").doc(PLAYER_A_UID).update({
      banned: true,
      updatedAt: new Date(Date.now() - 1000),
    })
  );
  await assertFails(
    pA.collection("players").doc(PLAYER_A_UID).update({
      createdAt: new Date(Date.now() - 1000),
      updatedAt: new Date(Date.now() - 1000),
    })
  );

  // Valid player progress partial update
  await assertSucceeds(
    pA.collection("players").doc(PLAYER_A_UID).update({
      cash: 4500,
      xp: 350,
      completedMissionsCount: 2,
      updatedAt: new Date(Date.now() - 1000),
    })
  );

  // Owner can list all players, ban Player A, and request reset
  await assertSucceeds(admin.collection("players").get());
  await assertSucceeds(
    admin.collection("players").doc(PLAYER_A_UID).update({
      banned: true,
      updatedAt: new Date(Date.now() - 500),
    })
  );

  // Banned player CANNOT self-unban
  await assertFails(
    pA.collection("players").doc(PLAYER_A_UID).update({
      banned: false,
      updatedAt: new Date(Date.now() - 200),
    })
  );

  // Owner can trigger reset & unban
  await assertSucceeds(
    admin.collection("players").doc(PLAYER_A_UID).update({
      banned: false,
      resetRequested: true,
      cash: 3200,
      xp: 0,
      level: 1,
      completedMissionsCount: 0,
      updatedAt: new Date(Date.now() - 100),
    })
  );
});

test("Tampered future timestamps are rejected", async () => {
  const admin = ownerDb();
  const future = new Date(Date.now() + 60000);
  await assertFails(
    admin.collection("gameConfig").doc("published").set({
      configJson: "{\"rewardMultiplier\":1.0}",
      version: 1,
      updatedBy: OWNER_UID,
      updatedAt: future,
    })
  );
});
