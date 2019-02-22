<?php

// BUILDSERVICE - automated compiling, execution, debugging, testing and profiling
// (c) Vedran Ljubovic and others 2014.
//
//     This program is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.
// 
//     This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
// 
//     You should have received a copy of the GNU General Public License
//     along with this program.  If not, see <http://www.gnu.org/licenses/>.

// buildservice configuration



// ----------------------------
// COMMON settings
// ----------------------------

// Commands and paths

$conf_tmp_path = "/tmp";
// Base directory for all files related to buildservice
$conf_basepath = "/tmp/buildservice";
$conf_unzip_command = "unzip";


// ----------------------------
// PULL settings
// ----------------------------

// Give some name to this buildhost
$buildhost_id = "localhost";

// Size of program output (stdout+stderr) is limited for performance and security reasons
$conf_max_program_output = 10000;

// Verbosity level for messages on stdout
// 0 = no output
// 1 = information about what is being done currently
// 2 = some debugging output
// 3 = forward output from all child processes to stdout
$conf_verbosity = 1;


// Maximum number of simultainously executed tasks... 10000 should be enough to choke the server :)
// However sometimes instances are incorrectly purged so this number can be increased as a stopgap measure
$conf_max_instances = 10000;


// JSON options

$conf_base_url = "http://192.168.0.17:8000";
$conf_push_url = $conf_base_url . "/push.php";
$conf_auth_url = $conf_base_url . "/auth.php";

$conf_json_login_required = false;
$conf_json_user = "someuser";
$conf_json_pass = "somepass";

$conf_json_max_retries = 10;



// ----------------------------------------------
// COMPILERS
// ----------------------------------------------

$conf_compilers = array(
	// GCC
	array(
		"name" => "gcc",
		"language" => "C",
		"compiler_path" => "/usr/bin/gcc",
		"executor_path" => "", // Compiler generates executables
		"cmd_line" => "COMPILER_PATH -o OUTPUT_FILE SOURCE_FILES OPTIONS",
		"exe_line" => "OUTPUT_FILE",
		"version_line" => "COMPILER_PATH --version | grep ^gcc",
		"features" => array(), // add features supported by this compiler 
	),

	// G++
	array(
		"name" => "g++",
		"language" => "C++",
		//"path" => "/opt/gcc-4.8.2/bin/g++",
		"compiler_path" => "/usr/bin/g++",
		"executor_path" => "", // Compiler generates executables
		//"cmd_line" => "COMPILER_PATH -o OUTPUT_FILE SOURCE_FILES -Wl,-rpath /opt/gcc-4.8.2/lib64 OPTIONS",
		"cmd_line" => "COMPILER_PATH -o OUTPUT_FILE SOURCE_FILES OPTIONS",
		"exe_line" => "OUTPUT_FILE",
		"version_line" => "COMPILER_PATH --version | grep ^g++",
		"features" => array( "c++11" ),
	),

	// JDK
	array(
		"name" => "jdk",
		"language" => "Java",
		"compiler_path" => "javac",
		"executor_path" => "java",
		"cmd_line" => "COMPILER_PATH OPTIONS SOURCE_FILES",
		"exe_line" => "EXECUTOR_PATH OUTPUT_FILE", // FIXME with java output files are always named Foo.class, so this needs to be hardcoded
		"version_line" => "COMPILER_PATH --version",
		"features" => array(), 
	),

	// PYTHON
	array(
		"name" => "python3",
		"language" => "Python",
		"compiler_path" => "/usr/bin/python3",
		"executor_path" => "/usr/bin/python3",
		"cmd_line" => "COMPILER_PATH -m py_compile OPTIONS SOURCE_FILES",
		"exe_line" => "EXECUTOR_PATH OPTIONS SOURCE_FILES",
		"version_line" => "COMPILER_PATH --version",
		"features" => array( "python3" ), // Python version 3 is used
	),
);


// ----------------------------------------------
// DEBUGGERS
// ----------------------------------------------

$conf_debuggers = array(
	array(
		"name" => "gdb",
		"path" => "gdb",
		"local_opts" => "", // add options that need to be passed every time
		"features" => array(),
		// options needed to process core dump (COREFILE will be replaced with filename)
		"opts_core" => "--batch -ex \"bt 100\" --core=COREFILE", 
		"version_line" => "PATH --version | grep ^GNU",
	),
);



// ----------------------------------------------
// PROFILERS
// ----------------------------------------------

$conf_profilers = array(
	array(
		"name" => "valgrind",
		"path" => "valgrind",
		"local_opts" => "", // add options that need to be passed every time
		"features" => array(),
		// options to pass to create a logfile that will be analyzed later
		"opts_log" => "--tool=exp-sgcheck --log-file=LOGFILE", 
		//"opts_log" => "--leak-check=full --log-file-exact=LOGFILE",  // old valgrind
		"timeout_ratio" => 2, // We expect valgrind to run twice as long as program alone
		// valgrind needs a lot of ram to work, sometimes as much as 100 MB for simple "hello world" style programs
		// We don't want to enforce usual memory limits but we also don't want misbehaving programs to crash our machine
		// Put roughly half your RAM below (in kB)
		"vmem_hard_limit" => 1000000,
		"version_line" => "PATH --version",
	),
	array(
		"name" => "valgrind",
		"path" => "valgrind",
		"local_opts" => "", // add options that need to be passed every time
		"features" => array(),
		// options to pass to create a logfile that will be analyzed later
		"opts_log" => "--leak-check=full --log-file=LOGFILE", 
		//"opts_log" => "--leak-check=full --log-file-exact=LOGFILE",  // old valgrind
		"timeout_ratio" => 2, // We expect valgrind to run twice as long as program alone
		// valgrind needs a lot of ram to work, sometimes as much as 100 MB for simple "hello world" style programs
		// We don't want to enforce usual memory limits but we also don't want misbehaving programs to crash our machine
		// Put roughly half your RAM below (in kB)
		"vmem_hard_limit" => 1000000,
		"version_line" => "PATH --version",
	),
);


// Lists of source filename extensions per language
$conf_extensions = array(
	"C"    => array( ".c", ".h" ),
	"C++"  => array( ".cpp", ".h", ".cxx", ".hxx" ),
	"Java" => array( ".java" ),
	"Python" => array( ".py" ),
);



// ----------------------------
// PUSH settings
// ----------------------------

$conf_push = array(
	// Is CLI interface enabled? Default: true
	// "cli_enabled" => true,
	
	// Is web service interface enabled? Default: true
	// "ws_enabled" => true,
);

// What to do when waiting for the queue lock too long? Set to 0 for "never"
$conf_qlock_time_limit = 1000; // seconds

// Possible values: "quit", "continue", "delete"
$conf_qlock_what = "continue";

// Which users are allowed to push new tasks
$conf_allow_push = array(
	// Set this to true to disable push entirely
	// "disabled" => true,
	
	// Require http basic auth. If set to true all users are allowed 
	// (but need to authenticate). If set to false, auth is not required.
	// Otherwise an array of allowed users. Default: false
	// "http_auth" => false,

	// Require valid PHP session. If set to true, require an active
	// session, false doesn't require a session. Otherwise an array of
	// session variables in the form "name" => "expected value", or
	// "exists_name" => true (which means that variable must exist). 
	// Default: false
	// "php_session" => false,
	
	// List of allowed remote hosts, or false if all hosts are allowed.
	// Default: false
	// "hosts" => false,
);

// Which users are allowed to pull existing tasks from PUSH.PHP service
$conf_allow_pull = array(
	// Set this to true to disable pulling (pointless?)
	// "disabled" => true,
	
	// Require http basic auth. If set to true all users are allowed 
	// (but need to authenticate). If set to false, auth is not required.
	// Otherwise an array of allowed users. Default: false
	// "http_auth" => false,

	// Require some predefined value(s) - such as a login - in PHP session.
	// If set to false, a session is not required. Otherwise an array of
	// session variables in the form "name" => "expected value", or 
	// "exists_name" => true (which means that variable must exist 
	// regardless of value). Expected value can also be an array of
	// expected values. Default: false
	// "php_session" => false,
	
	// List of allowed remote hostnames / IP addresses, or false if all 
	// hosts are allowed. Default: false
	// "hosts" => false,
);



?>
