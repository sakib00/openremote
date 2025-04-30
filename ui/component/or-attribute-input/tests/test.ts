// test.beforeEach(async ({}) => {});

// test("or-attribute-input", async ({ mount }) => {});

// import { test, expect } from "@playwright/test";
import { test, expect } from "@sand4rt/experimental-ct-web";
import { OrAttributeInput } from "@openremote/or-attribute-input";

test("render props", async ({ mount }) => {
  const component = await mount(OrAttributeInput, {
    props: {},
  });
  await expect(component).toContainText("test");
});
