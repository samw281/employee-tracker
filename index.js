const inquirer = require("inquirer");
const mysql = require("mysql2");
const connection = require("./db/db");

const menuQuestion = {
  name: "menu",
  type: "list",
  message: "What would you like to do?",
  choices: [
    "View all departments",
    "View all roles",
    "View all employees",
    "Add a department",
    "Add a role",
    "Add an employee",
    "Update a role",
    "I'm Done",
  ],
};
const addDepartmentQuestions = {
  name: "department",
  type: "input",
  message: "What is the name of the department?",
};
const addRoleQuestions = [
  {
    name: "title",
    type: "input",
    message: "What is the title of your role?",
  },
  {
    name: "salary",
    type: "input",
    message: "What is the new role's salary?",
  },
  {
    name: "departmentId",
    type: "input",
    message: "What is your roles department ID?",
  },
];
const addEmployeeQuestions = [
  {
    name: "firstName",
    type: "input",
    message: "What the new employee's first name?",
  },
  {
    name: "lastName",
    type: "input",
    message: "What is the employee's last name?",
  },
  {
    name: "managerId",
    type: "input",
    message: "Who is this employees manager?(Input the managers id)",
  },
  {
    name: "roleId",
    type: "input",
    message: "What is your employee's role? (Input the roles id)",
  },
];

function viewDepartments() {
  connection.query("SELECT * FROM department", (err, results) => {
    if (err) {
      console.log(err);
    }
    console.table(results);
    mainMenu();
  });
}
function viewRoles() {
  connection.query("SELECT * FROM role", (err, results) => {
    if (err) {
      console.log(err);
    }
    console.table(results);
    mainMenu();
  });
}
function viewEmployees() {
  connection.query("SELECT * FROM employee", (err, results) => {
    if (err) {
      console.log(err);
    }
    console.table(results);
    mainMenu();
  });
}
async function addDepartment() {
  await inquirer.prompt(addDepartmentQuestions).then((response) => {
    connection.query(
      `INSERT INTO department(name) VALUES (?)`,
      response.department,
      (err, results) => {
        if (err) {
          console.log(err);
        }
        connection.query("SELECT * FROM department", (err, results) => {
          console.table(results);
          mainMenu();
        });
      }
    );
  });
}
function addRole() {
  connection.query("SELECT * FROM department", (err, results) => {
    console.table(results);
    if (err) {
      console.log(err);
    }
    inquirer.prompt(addRoleQuestions).then((response) => {
      connection.query(
        `INSERT INTO role(title,salary,department_id) VALUES (?,?,?)`,
        [response.title, response.salary, response.departmentId],
        (err, results) => {
          if (err) {
            console.log(err);
          }
          connection.query("SELECT * FROM role", (err, results) => {
            console.table(results);
            mainMenu();
          });
        }
      );
    });
  });
}
function addEmployee() {
  connection.query("SELECT * FROM role", (err, results) => {
    console.table(results);
    connection.query("SELECT * FROM employee", (err, results) => {
      console.table(results);
      inquirer.prompt(addEmployeeQuestions).then((response) => {
        connection.query(
          "INSERT INTO employee(first_name,last_name,manager_id,role_id) VALUES (?,?,?,?)",
          [
            response.firstName,
            response.lastName,
            response.managerId,
            response.roleId,
          ],
          (err, results) => {
            connection.query("SELECT * FROM employee", (err, results) => {
              console.table(results);
              mainMenu();
            });
          }
        );
      });
    });
  });
}
function updateRole() {
  connection.query("SELECT * FROM role", (err, results) => {
    console.table(results);
    const rolesChoice = results.map((obj) => {
      return { name: obj.title, value: obj.id };
    });
    connection.query("SELECT * FROM employee", (err, results) => {
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
        connection.query(
          "UPDATE employee SET role_id = ? WHERE id = ?",
          [response.roles, response.employees],
          (err, results) => {
            connection.query("SELECT * FROM employee", (err, results) => {
              console.table(results);
              mainMenu();
            });
          }
        );
      });
    });
  });
}
function mainMenu() {
  inquirer.prompt(menuQuestion).then((response) => {
    if (response.menu === "View all departments") {
      viewDepartments();
    } else if (response.menu === "View all roles") {
      viewRoles();
    } else if (response.menu === "View all employees") {
      viewEmployees();
    } else if (response.menu === "Add a department") {
      addDepartment();
    } else if (response.menu === "Update a role") {
      updateRole();
    } else if (response.menu === "Add an employee") {
      addEmployee();
    } else if (response.menu === "I'm Done") {
      return;
    } else if (response.menu === "Add a role") {
      addRole();
    }
  });
}
mainMenu();
