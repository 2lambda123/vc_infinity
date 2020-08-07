<?php
// Initialize the session
session_start();
include_once "config.php";
include_once "functions.php";
 
// Check if the user is logged in, if not then redirect him to login page
if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    header("location: login.php");
    exit;
}

if(!isset($_SESSION["powerlevel"])){
    //echo "unset";
    $_SESSION["powerlevel"] = get_power_level_for_user($_SESSION["id"], $pdo);
} 

?>
 
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Welcome</title>
    <link rel="stylesheet" href="bootstrap.css">
    <style type="text/css">
        body{ font: 14px sans-serif; width:90%; padding: 20px;}
    </style>
</head>
<body>
    <div class="page-header">
        <h1><b><?php echo htmlspecialchars($_SESSION["realname"]); ?></b> @ <?php echo $_SITE["title"]; ?></h1>
    </div>
    <?php 
    //echo $_SESSION["powerlevel"];
    if ($_SESSION["powerlevel"] < 20){
        $approval_required = _("Your account must be approved before you can participate.");
        echo "<p>" . $approval_required . "</p>\n";
    }
    ?>
    <nav>
        <ul>
            <li><a href="../">View Site</a></li>
        <?php
         $powerlevel = $_SESSION["powerlevel"];
        
        if ($powerlevel >= 80){
            echo '<li><a href="manage-users.php">Manage and approve users.</a></li>';
        }
        if ($powerlevel >= 60){
            echo '<li><a href="pages.php">Upload and manage score pages.</a></li>';
        }
        if ($powerlevel >= 40) {
            echo '<li><a href="edit-audio.php">Edit audio.</a></li>';
        }
        if ($powerlevel >= 20) {
            echo '<li><a href="submit.php">Submit audio.<a/p></li>';
        }
    ?>
        <li><a href="prepare.html">Instructions on how to prepare audio.</a></li>
        <li><a href="edit-profile.php">Edit Profile</a></li>
    </ul>
    <p>    <a href="logout.php" class="btn btn-danger">Logout</a>
    </p>
</nav>
</body>
</html>
