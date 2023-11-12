import checkBusinessRegistrationNumber from "@utils/checkBusinessRegistrationNumber";
import * as E from "@errors";
import { test, expect } from "@jest/globals";

test("checkBusinessRegistrationNumber", async () => {
    expect(await checkBusinessRegistrationNumber("5133001104")).toBe(true);
    expect(await checkBusinessRegistrationNumber("")).toBe(false);
    expect(await checkBusinessRegistrationNumber("1234567890")).toBe(false);
});
