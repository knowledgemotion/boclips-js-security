import extractAuthEndpoint from "./extractAuthEndpoint";

test("extracts login endpoint for testing", () => {
  expect(extractAuthEndpoint("educators.testing-boclips.com"))
    .toEqual("https://login.testing-boclips.com/auth");
});

test("extracts login endpoint for staging", () => {
  expect(extractAuthEndpoint("educators.staging-boclips.com"))
    .toEqual("https://login.staging-boclips.com/auth");
});

test("extracts login endpoint for production", () => {
  expect(extractAuthEndpoint("boclips.com")).toEqual("https://login.boclips.com/auth");
});

test("localhost defaults to staging", () => {
  expect(extractAuthEndpoint("localhost:123123")).toEqual("https://login.staging-boclips.com/auth");
});

test("anything defaults to staging", () => {
  expect(extractAuthEndpoint("123_garbage")).toEqual("https://login.staging-boclips.com/auth");
});