<?php
// Include config file
//require_once "config.php";

function randomPassword() {
    $alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    $pass = array(); //remember to declare $pass as an array
    $alphaLength = strlen($alphabet) - 1; //put the length -1 in cache
    for ($i = 0; $i < 8; $i++) {
        $n = rand(0, $alphaLength);
        $pass[] = $alphabet[$n];
    }
    return implode($pass); //turn the array into a string
}

function get_userid($fusername, $pdo){

    $id = "";

    $sql = "SELECT userid  FROM users WHERE username = :username";
        
    if($fstmt = $pdo->prepare($sql)){
        // Bind variables to the prepared statement as parameters
        $fstmt->bindParam(":username", $fusername, PDO::PARAM_STR);
        

        
        // Attempt to execute the prepared statement
        if($fstmt->execute()){
            // Check if username exists, if yes then get id
            if($fstmt->rowCount() == 1){
                if($row = $fstmt->fetch()){
                    $id = $row["userid"];
                }
            }
        }
        unset($fstmt);
    }

    return $id;

}

function password_reset($fuid, $pdo){

    $password = randomPassword();
    $hash = password_hash($password, PASSWORD_DEFAULT); // Creates a password hash

    $url = "Something went wrong";

    $sql = "UPDATE users SET temp_password = :tpass WHERE userid = :id";
        
    if($stmt = $pdo->prepare($sql)){
        // Bind variables to the prepared statement as parameters
        $stmt->bindParam(":tpass", $param_password, PDO::PARAM_STR);
        $stmt->bindParam(":id", $param_id, PDO::PARAM_INT);
        
        $param_password = $hash;
        $param_id = (int)$fuid;

        // Attempt to execute the prepared statement
        if($stmt->execute()){
            // Password updated successfully. Destroy the session, and redirect to login page


            $data = array(
                "id" => $fuid,
                "hash" => $hash
            );

            $url = "https://infinity.vocalconstructivists.com/upload/email-verify.php?" . http_build_query($data);
        }
        unset($fstmt);
    }
    return $url;
}

function clear_temp_password($fuid, $pdo) {
    $sql = "UPDATE users SET temp_password = '' WHERE userid = :userid";
        
    if($stmt = $pdo->prepare($sql)){
        // Bind variables to the prepared statement as parameters
        $stmt->bindParam(":userid", $param_userid, PDO::PARAM_STR);
            
        // Set parameters
        $param_userid = (int)$fuid;

        if($stmt->execute()){}

        unset($fstmt);
    }
}

function get_power_level($rolecode, $pdo){

    $powerlevel = 0;

    $sql = "SELECT role_power_level FROM `roles` where role_rolecode = :rolecode";
    if($stmt = $pdo->prepare($sql)){
        // Bind variables to the prepared statement as parameters
        $stmt->bindParam(":rolecode", $param_rolecode, PDO::PARAM_STR);
        $param_rolecode = $rolecode;
        if($stmt->execute()){
            // Check if rolecode exists, if yes then get powerlevel
            if($stmt->rowCount() == 1){
                if($row = $stmt->fetch()){
                    $powerlevel = $row["role_power_level"];
                    //echo $powerlevel;
                }
            }
        }
        unset($stmt);
    }
    return $powerlevel;

}

function get_page_called_for_user($fuid, $pdo){

    // fix this properly soon

    return "panel";

}
function get_score_for_user($fuid, $pdo) {}

function get_group_for_user($fuid, $pdo) {}

function get_score_for_group($gcode, $pdo){

    $scorecode = "";

    $sql = "SELECT org_scorcode FROM `organisations` where orgcode = :gcode";
    if($stmt = $pdo->prepare($sql)){
        // Bind variables to the prepared statement as parameters
        $stmt->bindParam(":gcode", $param_gcode, PDO::PARAM_STR);
        $param_gcode = $gcode;
        if($stmt->execute()){
            // Check if rolecode exists, if yes then get powerlevel
            if($stmt->rowCount() == 1){
                if($row = $stmt->fetch()){
                    $scorecode = $row["org_scorcode"];
                }
            }
        }

        unset($stmt);
    }
    return $scorecode;
   
}

function get_page_called_for_score($scorecode, $pdo){

    $page_called = "";

    $sql = "SELECT s_page_called FROM `scores` where s_scorecode = :scorecode";
    if($stmt = $pdo->prepare($sql)){
        // Bind variables to the prepared statement as parameters
        $stmt->bindParam(":scorecode", $param_gcode, PDO::PARAM_STR);
        $param_gcode = $scorecode;
        if($stmt->execute()){
            // Check if rolecode exists, if yes then get powerlevel
            if($stmt->rowCount() == 1){
                if($row = $stmt->fetch()){
                    $page_called = $row["s_page_called"];
                }
            }
        }

        unset($stmt);
    }
    return $page_called;
   
}

function get_page_called_for_group($gcode, $pdo){

    $page_called = "";

    $scorecode = get_score_for_group($gcode, $pdo);
    $page_called = get_page_called_for_score($scorecode, $pdo);

    return $page_called;

}


function get_power_level_for_user($fuid, $pdo){

    $powerlevel = 0;

    $sql = "SELECT u_rolecode FROM `users` where userid = :userid";
    if($stmt = $pdo->prepare($sql)){
        // Bind variables to the prepared statement as parameters
        $stmt->bindParam(":userid", $param_userid, PDO::PARAM_INT);
        $param_userid = (int) $fuid;
        if($stmt->execute()){
            // Check if rolecode exists, if yes then get powerlevel
            if($stmt->rowCount() == 1){
                if($row = $stmt->fetch()){
                    $rolecode = $row["u_rolecode"];
                    $powerlevel = get_power_level($rolecode, $pdo);
                }
            }
        }

        unset($stmt);
    }
    return $powerlevel;
}

function lazy_power_check($fuid, $pdo, $must_be_this_powerful_to_ride){

    $powerlevel = 0;
    $do_query = false;

    if(!isset($_SESSION)){ 
        $do_query = true;

    }elseif(!isset($_SESSION["powerlevel"])){
        if(!isset($fuid)){
            $fuid = $_SESSION["id"];
        }
        $do_query = true;
    } else {
        $powerlevel = $_SESSION["powerlevel"];
    }

    if($do_query){
        $powerlevel = get_power_level_for_user($fuid, $pdo);
    }

    return ($powerlevel >= $must_be_this_powerful_to_ride);

}

?>