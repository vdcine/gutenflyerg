import {test,expect} from "bun:test";
import {getNextWednesday} from "./getNextWednesday.js";
test ("que devuelva algun valor", () =>{
	expect(getNextWednesday()).toBeDefined();});
test ("que devuelva un string", () => {
	expect(typeof getNextWednesday()).toBe("string");});
test ("que contenga 2026", () => {
	expect(getNextWednesday()).toContain("2026");});
