const inquirer = require("inquirer");
const mysql = require("mysql2");
const db = require("./db/db");
require("console.table");

const menuQuestions = {
  type: "list",
  name: "menu",
  message: "What would you like to do?",
  choices: [
    "View departments",
    "View roles",
    "View employees",
    "Add a new department",
    "Add a role",
    "Add an employee",
    "Update a role",
    "Return",
  ],
};
const addDepartmentQuestions = {
  type: "input",
  name: "department",
  message: "What is the name of the new department?",
};
const addRoleQuestions = [
  {
    type: "input",
    name: "title",
    message: "What is the title of the role?",
  },
  {
    type: "input",
    name: "salary",
    message: "What is the salary?",
  },
  {
    type: "input",
    name: "departmentId",
    message: "What is the department ID?",
  },
];
const addEmpQuestions = [
  {
    type: "input",
    name: "fName",
    message: "What the new employee's first name?",
  },
  {
    type: "input",
    name: "lName",
    message: "What is the employee's last name?",
  },
  {
    type: "input",
    name: "manId",
    message: "What is the new employee's manager's ID?",
  },
  {
    type: "input",
    name: "roleId",
    message: "What is the employee's role ID?",
  },
];

function viewAllDep() {
  db.query("SELECT * FROM department", (err, results) => {
    if (err) {
      console.log(err);
    }
    console.table(results);
    startMenu();
  });
}
function viewAllRoles() {
  db.query("SELECT * FROM role", (err, results) => {
    if (err) {
      console.log(err);
    }
    console.table(results);
    startMenu();
  });
}
function viewAllEmp() {
  db.query("SELECT * FROM employee", (err, results) => {
    if (err) {
      console.log(err);
    }
    console.table(results);
    startMenu();
  });
}
async function addNewDep() {
  await inquirer.prompt(addDepartmentQuestions).then((response) => {
    db.query(
      `INSERT INTO department(name) VALUES (?)`,
      response.department,
      (err, results) => {
        if (err) {
          console.log(err);
        }
        db.query("SELECT * FROM department", (err, results) => {
          console.table(results);
          startMenu();
        });
      }
    );
  });
}
function addNewRole() {
  db.query("SELECT * FROM department", (err, results) => {
    console.table(results);
    if (err) {
      console.log(err);
    }
    inquirer.prompt(addRoleQuestions).then((response) => {
      db.query(
        `INSERT INTO role(title,salary,department_id) VALUES (?,?,?)`,
        [response.title, response.salary, response.departmentId],
        (err, results) => {
          if (err) {
            console.log(err);
          }
          db.query("SELECT * FROM role", (err, results) => {
            console.table(results);
            startMenu();
          });
        }
      );
    });
  });
}
function addEmp() {
  db.query("SELECT * FROM role", (err, results) => {
    console.table(results);
    db.query("SELECT * FROM employee", (err, results) => {
      console.table(results);
      inquirer.prompt(addEmpQuestions).then((response) => {
        db.query(
          "INSERT INTO employee(first_name,last_name,manager_id,role_id) VALUES (?,?,?,?)",
          [
            response.fName,
            response.lName,
            response.manId,
            response.roleId,
          ],
          (err, results) => {
            db.query("SELECT * FROM employee", (err, results) => {
              console.table(results);
              startMenu();
            });
          }
        );
      });
    });
  });
}
function updateEmpRole() {
  db.query("SELECT * FROM role", (err, results) => {
    console.table(results);
    const rolesChoice = results.map((obj) => {
      return { name: obj.title, value: obj.id };
    });
    db.query("SELECT * FROM employee", (err, results) => {
      console.table(results);
      const employeeChoice = results.map((obj) => {
        return { name: obj.first_name, value: obj.id };
      });
      const newQuestion = [
        {
          name: "employees",
          type: "list",
          message: "Which employee would you like to update?",
          choices: employeeChoice,
        },
        {
          name: "roles",
          type: "list",
          message: "Which role would you like to update the employee with?",
          choices: rolesChoice,
        },
      ];
      inquirer.prompt(newQuestion).then((response) => {
        db.query(
          "UPDATE employee SET role_id = ? WHERE id = ?",
          [response.roles, response.employees],
          (err, results) => {
            db.query("SELECT * FROM employee", (err, results) => {
              console.table(results);
              startMenu();
            });
          }
        );
      });
    });
  });
}
function startMenu() {
  inquirer.prompt(menuQuestions).then((response) => {
    if (response.menu === "View departments") {
      viewAllDep();
    } else if (response.menu === "View roles") {
      viewAllRoles();
    } else if (response.menu === "View employees") {
      viewAllEmp();
    } else if (response.menu === "Add a new department") {
      addNewDep();
    } else if (response.menu === "Add a role") {
      addNewRole();
    } else if (response.menu === "Add an employee") {
      addEmp();
    } else if (response.menu === "Update a role") {
      updateEmpRole();
    } else if (response.menu === "Return") {
      return;
    }
  });
}
startMenu();
