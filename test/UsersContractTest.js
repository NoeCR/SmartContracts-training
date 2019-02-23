const assert = require("assert");
const AssertionError = require("assert").AssertionError;
const Web3 = require("web3");
// Estabece configuración del servidor de Ganache donde desplegamos los contratos
const provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");
const web3 = new Web3(provider);

// Obtenemos los datos compilados de nuestro contrato en bytecode y ABI (application binary interface)
const { interface, bytecode } = require("../scripts/compile");

let accounts;
let usersContract;
// Obtenemos las cuentas y la información del contrato ANTES DE LA EJECUCION DE CADA TEST
// Desplegamos los datos del contrato y lo enviamos desde la cuenta inicial estableciendo el gas que consumira la transacción
beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  usersContract = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode
    })
    .send({ from: accounts[0], gas: "1000000" });
});

// definicionnde los test
describe("The UsersContract", async () => {
  // Comprueba si se despliega correctamente el contrato
  it("should deploy", () => {
    console.log(usersContract.options.address);
    assert.ok(usersContract.options.address);
  });
  // Comprueba si se loguea correctamente un usuario
  it("should join a user", async () => {
    let name = "Carlos";
    let surname = "Sainz";

    await usersContract.methods
      .join(name, surname)
      .send({ from: accounts[0], gas: "500000" });
  });
  // Comprueba si devuelve correctamente un usuario
  it("should retrieve a user", async () => {
    let name = "Carlos";
    let surname = "Sainz";

    await usersContract.methods
      .join(name, surname)
      .send({ from: accounts[0], gas: "500000" });

    let user = await usersContract.methods.getUser(accounts[0]).call();

    assert.equal(name, user[0]);
    assert.equal(surname, user[1]);
  });
  // Comprueba que no pueda registrarse un usuario que ya este registrado
  it("should not allow joining an account twice", async () => {
    await usersContract.methods
      .join("Pedro", "Lopéz")
      .send({ from: accounts[0], gas: "500000" });

    try {
      await usersContract.methods
        .join("Ana", "Goméz")
        .send({ from: accounts[0], gas: "500000" });
      // Si ejecuta el metodo anterior forzamos el fail, en caso contrario la excepcion sera recogida por el catch
      assert.fail("Same account cant join twice");
    } catch (e) {
      if (e instanceof AssertionError) {
        assert.fail(e.message);
      }
    }
  });
  // Test: comprueba que no podamos recuperar un usuario que no este registrado
  it("should not allow retrieving a not registered user", async () => {
    try {
      await usersContract.methods.getUser(accounts[0]).call();
      assert.fail("user should not be registered");
    } catch (e) {
      if (e instanceof AssertionError) {
        assert.fail(e.message);
      }
    }
  });
  // Test: recupera el total de usuarios registrados
  it("should return total users", async () => {
    await usersContract.methods
      .join("Pedro", "Lopéz")
      .send({ from: accounts[0], gas: "500000" });

    await usersContract.methods
      .join("Maria", "Jimenez")
      .send({ from: accounts[1], gas: "500000" });

    let nUsers = await usersContract.methods.totalUsers().call();
    assert.equal(nUsers, 2);
  });
});
