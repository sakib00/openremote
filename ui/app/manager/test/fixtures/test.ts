import { test as base, expect, Response, type Page } from "@playwright/test";
import { getAppUrl } from "../utils";
import { assets } from "./data/assets";

interface Fixtures {
  /**
   * Open page on the specified realm
   * @param realm The realm to open
   */
  openRealm: (realm: string) => Promise<null | Response>;
  /**
   * Login as user
   * @param user Username (admin or other)
   */
  login: (user: string) => void;
  /**
   * Logout and delete login certification
   */
  logout: (user: string) => void;
  /**
   * Navigate to a setting page inside the manager
   * for the setting list menu at the top right
   * @param setting Name of the setting menu item
   */
  navigateToMenuItem: (setting: string) => Promise<void>;
  /**
   * Navigate to a certain tab page
   * @param tab Tab name
   */
  navigateToTab: (tab: string) => Promise<void>;
  /**
   * Create Realm with name
   * @param name realm name
   */
  addRealm: (name: string, first?: boolean) => Promise<void>;
  /**
   * Switch to a realm in the manager's realm picker
   * @param name Name of custom realm
   */
  switchToRealmByRealmPicker: (name: string) => Promise<void>;
  /**
   * Create user
   * @param username
   * @param password
   */
  addUser: (username: string, password: string) => Promise<void>;
  /**
   * Switch between modify mode and view mode
   * @param targetMode view or modify
   */
  switchMode: (targetMode: string) => Promise<void>;
  /**
   * create new empty assets
   * @param update for checking if updating values is needed
   */
  addAssets: (update: boolean, configOrLoction) => Promise<void>;
  /**
   * unselect the asset
   */
  unselect: () => Promise<void>;
  /**
   * update asset in the general panel
   * @param attr attribute's name
   * @param type attribute's input type
   * @param value input value
   */
  updateAssets: (attr: string, type: string, value: string) => Promise<void>;
  /**
   * update the data in the modify mode
   * @param attr attribute's name
   * @param type attribute's input type
   * @param value input value
   */
  updateInModify: (attr: string, type: string, value: string) => Promise<void>;
  /**
   * update location so we can see in the map
   * @param location_x horizental coordinator (start from left edge)
   * @param location_y vertail coordinator (start from top edge)
   */
  updateLocation: (location_x: number, location_y: number) => Promise<void>;
  /**
   * select two config items for an attribute
   * @param item_1 the first config item
   * @param item_2 the second config item
   * @param attr attribute's name
   */
  configItem: (item_1: string, item_2: string, attr: string) => Promise<void>;
  /**
   * set config item for rule and insight to use
   * @param item1 the first config item
   * @param item2 the second config item
   * @param attr1 attribute's name
   * @param attr2 attribute's name
   */
  setConfigItem: (item_1: string, item_2: string, attr_1: string, attr_2: string) => Promise<void>;
  /**
   * Delete a certain realm by its name
   * @param name Realm's name
   */
  deleteRealm: (realm: string) => Promise<void>;
  /**
   * Delete a certain asset by its name
   * @param asset asset's name
   */
  deleteSelectedAsset: (asset: string) => Promise<void>;
  /**
   * Save
   */
  save: () => Promise<void>;
  /**
   *  setup the testing environment by giving the realm name and setup level
   *  // lv0 is no setup at all
   *  // lv1 is to create a realm
   *  // lv2 is to create a user
   *  // lv3 is to create empty assets
   *  // lv4 is to set the values for assets
   * @param realm realm name
   * @param level level (lv0, lv1, etc.)
   * @param configOrLoction update on config or location, default as no
   */
  setup: (realm: string, level: string, configOrLocation: string) => Promise<void>;
  /**
   *  Clean up the environment
   *  Called in After()
   */
  cleanUp: () => Promise<void>;
}

export const test = base.extend<Fixtures>({
  async openRealm({ baseURL, page }, use) {
    // TODO: handle this per app ?
    await use((realm) => page.goto(getAppUrl(baseURL!, realm)));
  },
  async login({}, use) {
    await use(async (user) => {
      await this.wait(500);
      const isLogin = (await this.isVisible('input[name="username"]')) || false;
      if (isLogin) {
        let password = global.passwords[user];
        await this.page?.fill('input[name="username"]', user);
        await this.page?.fill('input[name="password"]', password);
        await this.page?.keyboard.press("Enter");
        // console.log(`User: "${user}" logged in,   ` + timeCost(false) + "s");
      }
    });
  },
  async logout({}, use) {
    await use(async (user) => {
      const isPanelVisibile = await this.isVisible('button:has-text("Cancel")');
      if (isPanelVisibile) {
        await this.click('button:has-text("Cancel")');
      }
      const isMenuBtnVisible = await this.isVisible("#menu-btn-desktop");
      if (isMenuBtnVisible) {
        await this.click("#menu-btn-desktop");
        await this.click("text=Log out");
      }
    });
  },
  /**
   * Repeatable actions
   */
  async navigateToMenuItem({}, use) {
    await use(async (setting) => {
      // setStepStartTime();
      await this.wait(500);
      await this.click('button[id="menu-btn-desktop"]');
      await this.wait(500);
      const isItemVisible = await this.isVisible(`text=${setting}`);
      if (isItemVisible) {
        await this.click(`text=${setting}`);
      } else {
        console.log("not rendered yet");
      }
      // console.log(`Navigated to "${setting}" meun item,   ` + timeCost(false) + "s");
    });
  },
  async navigateToTab({ page }, use) {
    await use(async (tab) => {
      await page.click(`#desktop-left a:has-text("${tab}")`);
      // await this.wait(1500);
    });
  },
  async addRealm({ page }, use) {
    await use(async (name, first = false) => {
      // await this.wait(500);
      const isVisible = await this.isVisible(`[aria-label="attribute list"] span:has-text("${name}")`);
      if (!isVisible) {
        await page.click("text=Add Realm");
        await page.fill('#attribute-meta-row-1 >> text=Realm Enabled >> input[type="text"]', name);

        await page?.locator('input[type="text"]').nth(3).fill(name);
        await page.click('button:has-text("create")');

        // await this.wait(first == true ? 15000 : 10000);
        // const count = await this.count(`[aria-label="attribute list"] span:has-text("${name}")`)
        // await expect(count).toEqual(1)
        // await console.log("Realm: " + `"${name}"` + " added,   " + timeCost(false) + "s");
      }
    });
  },
  async switchToRealmByRealmPicker({ page }, use) {
    await use(async (name) => {
      await page.waitForTimeout(500);
      await page.click("#realm-picker");
      await page.waitForTimeout(500);
      await page.click(`li[role="menuitem"]:has-text("${name}")`);
    });
  },
  async addUser({ page }, use) {
    await use(async (username, password) => {
      // setStepStartTime();
      /**
       * add user
       */
      await page.waitForTimeout(100);
      // go to user page
      await page.click("#menu-btn-desktop");
      await page.click("text=Users");
      await page.waitForTimeout(500);
      const isVisible = await page.isVisible('main[role="main"] >> text=' + username);
      // add user if not exist
      if (!isVisible) {
        // type in name
        await page.click(".mdi-plus >> nth=0");
        await page.fill('input[type="text"] >> nth=0', username);
        // type in password
        await page.fill('#password-user0 input[type="password"]', password);
        await page.fill('#repeatPassword-user0 input[type="password"]', password);
        // select permissions
        await page.click('div[role="button"]:has-text("Realm Roles")');
        await page.click('li[role="menuitem"]:has-text("Default-roles-smartcity")');
        await page.click('div[role="button"]:has-text("Manager Roles")');
        await page.click('li[role="menuitem"]:has-text("Read")');
        await page.click('li[role="menuitem"]:has-text("Write")');
        await page.waitForTimeout(1500);

        await page.click('div[role="button"]:has-text("Manager Roles")');
        // create user
        await page.click('button:has-text("create")');
        await page.waitForTimeout(1500);
        // console.log(`User: "${username}" added,    ` + timeCost(false) + "s");
      } else {
      }
    });
  },
  async switchMode({ page }, use) {
    await use(async (targetMode) => {
      await page.waitForTimeout(400);
      const atModifyMode = await page.isVisible('button:has-text("View")');
      const atViewMode = await page.isVisible('button:has-text("Modify")');

      if (atModifyMode && targetMode == "view") {
        await page.click('button:has-text("View")');
        console.log(":::::: at view mode");
      }
      if (atViewMode && targetMode == "modify") {
        await page.click('button:has-text("Modify")');
        console.log(":::::: at modify mode");
      }
    });
  },
  async addAssets({ page }, use) {
    await use(async (update, configOrLoction) => {
      // const addAssetTime = new Date() / 1000;

      await this.wait(500);

      // Goes to asset page
      await this.click("#desktop-left a:nth-child(2)");

      // select conosle first to enter into the modify mode
      await this.click(`#list-container >> text="Consoles"`);
      await this.switchMode("modify");
      await this.unselect();

      // create assets accroding to assets array
      for (let asset of assets) {
        // setStepStartTime();
        let isAssetVisible = await this.isVisible(`#list-container >> text=${asset.name}`);
        try {
          if (!isAssetVisible) {
            await this.click(".mdi-plus");
            await this.click(`text=${asset.asset}`);
            await this.fill('#name-input input[type="text"]', asset.name);
            await this.click("#add-btn");
            await this.wait(500);
            // check if at modify mode
            // if yes we should see the save button then save
            const isSaveBtnVisible = await this.isVisible('button:has-text("Save")');
            console.log("save btn is " + isSaveBtnVisible);
            if (isSaveBtnVisible) {
              console.log("ready to save");
              await this.click('button:has-text("Save")');
            }
            console.log(":::::: emtpy asset has been added");
            await this.switchMode("modify");
            // await this.unselect()
            // await this.click(`#list-container >> text=${asset.name}`)
            if (update) {
              // switch to modify mode if at view mode

              // update in modify mode
              if (configOrLoction == "location") {
                await this.updateLocation(asset.location_x, asset.location_y);
                console.log(":::::: location updated");
              } else if (configOrLoction == "config") {
                await this.setConfigItem(
                  asset.config_item_1,
                  asset.config_item_2,
                  asset.config_attr_1,
                  asset.config_attr_2
                );
                console.log(":::::: config items have been added");
              } else {
                await this.updateLocation(asset.location_x, asset.location_y);
                await this.setConfigItem(
                  asset.config_item_1,
                  asset.config_item_2,
                  asset.config_attr_1,
                  asset.config_attr_2
                );
                console.log(":::::: both settings have been added");
              }

              await this.updateInModify(asset.attr_1, asset.a1_type, asset.v1);
              await this.updateInModify(asset.attr_2, asset.a2_type, asset.v2);

              await this.save();

              //switch to view mode
              await this.switchMode("view");
              // update value in view mode
              await this.updateAssets(asset.attr_3, asset.a3_type, asset.v3);
              await this.wait(500);

              //switch to modify mode
              await this.switchMode("modify");
            }
            await this.unselect();
            // console.log(
            //   "Asset: " +
            //     `"${asset.name}"` +
            //     " with " +
            //     configOrLoction +
            //     " updated has been added,  " +
            //     timeCost(false) +
            //     "s"
            // );
          }
        } catch (error) {
          console.log("error" + error);
        }
      }
      // console.log("Adding assets takes " + (new Date() / 1000 - addAssetTime).toFixed(3) + "s");
    });
  },
  async unselect({ page }, use) {
    await use(async () => {
      await this.wait(500);
      const isCloseVisible = await this.isVisible(".mdi-close >> nth=0");

      // leave modify mode
      // if (isViewVisible) {
      //     await this.click('button:has-text("View")')
      //     let btnDisgard = await this.isVisible('button:has-text("Disgard")')
      //     if (btnDisgard) {
      //         await this.click('button:has-text("Disgard")')
      //         console.log("didn't save successfully")
      //     }
      // }

      // unselect the asset
      if (isCloseVisible) {
        //await this.page?.locator('.mdi-close').first().click()
        await this.click(".mdi-close >> nth=0");
      }

      await this.wait(500);
    });
  },
  async updateAssets({ page }, use) {
    await use(async (attr, type, value) => {
      await this.fill(`#field-${attr} input[type="${type}"]`, value);
      await this.click(`#field-${attr} #send-btn span`);
    });
  },
  async updateInModify({ page }, use) {
    await use(async (attr, type, value) => {
      await this.fill(`text=${attr} ${type} >> input[type="number"]`, value);
      console.log("::::::  " + attr + " has been updated");
    });
  },
  async updateLocation({ page }, use) {
    await use(async (location_x, location_y) => {
      await this.click("text=location GEO JSON point >> button span");
      await this.page?.mouse.click(location_x, location_y, { delay: 1000 });
      await this.click('button:has-text("OK")');
    });
  },
  async configItem({ page }, use) {
    await use(async (item_1, item_2, attr) => {
      await this.wait(500);
      await this.click(`td:has-text("${attr} ") >> nth=0`);
      await this.wait(500);
      await this.click(".attribute-meta-row.expanded td .meta-item-container div .item-add or-mwc-input #component");
      await this.click(`li[role="checkbox"]:has-text("${item_1}")`);
      await this.click(`li[role="checkbox"]:has-text("${item_2}")`);
      await this.click('div[role="alertdialog"] button:has-text("Add")');
      await this.wait(500);

      // close attribute menu
      await this.click(`td:has-text("${attr}") >> nth=0`);
    });
  },
  async setConfigItem({ page }, use) {
    await use(async (item_1, item_2, attr_1, attr_2) => {
      await this.configItem(item_1, item_2, attr_1);
      await this.wait(500);
      await this.configItem(item_1, item_2, attr_2);
      await this.wait(500);
    });
  },
  async deleteRealm({ page }, use) {
    await use(async (realm) => {
      // setStepStartTime();
      await this.wait(500);
      await this.click(`[aria-label="attribute list"] span:has-text("${realm}")`);
      await this.click('button:has-text("Delete")');
      await this.wait(500);
      await this.fill('div[role="alertdialog"] input[type="text"]', realm);
      await this.click('button:has-text("OK")');
      // wait for backend to response
      await this.wait(5000);
      try {
        const count = await this.count('[aria-label="attribute list"] span:has-text("smartcity")');
        await expect(count).toBe(0);

        await this.goToRealmStartPage("master");
        await this.wait(500);
        const isVisible = await this.isVisible("#realm-picker");
        await expect(isVisible).toBeFalsy();
        // await console.log(`Realm: "${realm}" deleted,    ` + timeCost(false) + "s");
      } catch (e) {
        console.log(e);
      }
    });
  },
  async deleteSelectedAsset({ page }, use) {
    await use(async (asset) => {
      // setStepStartTime();
      await this.navigateToTab("Assets");
      let assetSelected = await this.count(`text=${asset}`);
      if (assetSelected > 0) {
        await this.click(`text=${asset}`);
        await this.click(".mdi-delete");
        await this.click('button:has-text("Delete")');
        await this.wait(1500);
        let visibile = await this.count(`text=${asset}`);
        await expect(visibile).toBeFalsy();
      } else {
        console.log(`Asset: "${asset}" does not exsit`);
      }
      // console.log(`Asset: "${asset}" has been deleted,    ` + timeCost(false) + "s");
    });
  },
  async save({ page }, use) {
    await use(async () => {
      console.log(":::::: in saving");
      await this.wait(200);
      await this.click("#edit-container");
      await this.wait(200); // wait for button to enabled
      const isSaveBtnVisible = await this.isVisible('button:has-text("Save")');
      if (isSaveBtnVisible) {
        await this.click('button:has-text("Save")');
      }
      await this.wait(200);
      const isDisabled = await this.page.locator('button:has-text("Save")').isDisabled();
      //asset modify
      const ifModifyMode = await this.isVisible('button:has-text("OK")');
      if (ifModifyMode) {
        await this.click('button:has-text("OK")');
        console.log("panel closed");
      }
      if (!isDisabled) {
        await this.click('button:has-text("Save")');
        await this.wait(200);
      }
      await expect(await this.page.locator('button:has-text("Save")')).toBeDisabled();
    });
  },
  async setup({ page }, use) {
    await use(async (realm, level, configOrLocation = "no") => {
      // global.startTime = new Date() / 1000;

      if (level !== "lv0") {
        await this.openApp("master");
        await this.login("admin");

        await this.wait(1500);
        const isPickerVisible = await this.isVisible("#realm-picker");
        // add realm
        if (!isPickerVisible) {
          await this.navigateToMenuItem("Realms");
          await this.addRealm(realm);
        }
        await this.switchToRealmByRealmPicker(realm);

        const update = level == "lv4" ? true : false;
        // add user
        if (level >= "lv2") {
          await this.addUser("smartcity", global.passwords["smartcity"]);
          // add assets
          if (level >= "lv3") {
            await this.logout();
            await this.goToRealmStartPage(realm);
            await this.login("smartcity");
            await this.addAssets(update, configOrLocation);
          }
        }
        await this.logout();
        // console.log(level + " setup takes " + timeCost(true) + "s");
      }
    });
  },
  async cleanUp({ page }, use) {
    await use(async () => {
      // const cleanTime = new Date() / 1000;

      // ensure login as admin into master
      await this.wait(500);
      await this.goToRealmStartPage("master");
      await this.login("admin");
      // must wait for the realm picker to be rendered
      await this.wait(1500);
      const isPickerVisible = await this.isVisible("#realm-picker");
      if (isPickerVisible) {
        // switch to master realm to ensure being able to delete custom realm
        await this.switchToRealmByRealmPicker("master");
        // delete realms
        // should delete everything and set the envrioment to beginning
        await this.navigateToMenuItem("Realms");
        await this.deleteRealm("smartcity");
      }
      // console.log("Clean up takes " + (new Date() / 1000 - cleanTime).toFixed(3) + "s");
    });
  },
});
