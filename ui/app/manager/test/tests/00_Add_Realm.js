import { expect } from "@playwright/test";
import { test } from "../fixtures/test";

test.beforeEach(async ({ openRealm }) => {
  await openRealm("master");
});

test("Add Realm", async ({ page, addRealm }) => {
  // When Login to OpenRemote "master" realm as "admin"
  // When Navigate to "Realms" page
  // Then Add a new Realm
  await addRealm("smartcity", true);
  // When Select smartcity realm
  await this.click("#realm-picker");
  await this.click('li[role="menuitem"]:has-text("smartcity")');
  // Then We see the smartcity realm
  expect(page.locator('div[id="realm-picker"]')).toContainText("smartcity");
});
