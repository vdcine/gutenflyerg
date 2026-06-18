import {test,expect} from "bun:test";
import {getNextWednesday} from "../scripts/storage.js";
test ("que devuelva algun valor", () =>{

	expect(getNextWednesday()).toBeDefined();});
test ("que devuelva un string", () => {

	expect(typeof getNextWednesday()).toBe("string");});
test ("que contenga 2026", () => {
	expect(getNextWednesday()).toContain("2026");});

test ("que devuelva dia de la semana", () => {
	const miercoles= new Date(getNextWednesday());
	expect(miercoles.getDay()).toBe(3);}); 

test ("que devuelva numero del proximo miercoles", () => {
	const fecha= new Date(getNextWednesday());
	expect(fecha.getDate()).toBe(27);});

test ("que devuelva la fecha del proximo miercoles", () => {
	expect(getNextWednesday()).toBe("2026-05-27");});
