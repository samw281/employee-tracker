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
const addEmployeeQuestions = [
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

function viewAllDepartments() {
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
function viewAllEmployees() {
  db.query("SELECT * FROM employee", (err, results) => {
    if (err) {
      console.log(err);
    }
    console.table(results);
    startMenu();
  });
}
async function addNewDepartment() {
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
function addEmployee() {
  db.query("SELECT * FROM role", (err, results) => {
    console.table(results);
    db.query("SELECT * FROM employee", (err, results) => {
      console.table(results);
      inquirer.prompt(addEmployeeQuestions).then((response) => {
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
function updateEmployeeRole() {
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
          message: "Who would you like to update?",
          choices: employeeChoice,
        },
        {
          name: "roles",
          type: "list",
          message: "Which would you like to update the employee with?",
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
      viewAllDepartments();
    } else if (response.menu === "View roles") {
      viewAllRoles();
    } else if (response.menu === "View employees") {
      viewAllEmployees();
    } else if (response.menu === "Add a new department") {
      addNewDepartment();
    } else if (response.menu === "Add a role") {
      addNewRole();
    } else if (response.menu === "Add an employee") {
      addEmployee();
    } else if (response.menu === "Update a role") {
      updateEmployeeRole();
    } else if (response.menu === "Return") {
      return;
    }
  });
}
startMenu();
