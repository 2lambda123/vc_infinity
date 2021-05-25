<?php

session_start();
 
include_once "config.php";
include_once "functions.php";




//The json file should have:
// panel, x, y, flac, scores, tags

// per panel construction

// for each panel

// get all the accepted audio ids, x and y
// check edited audio to find the flac id and file 
// if not found check duplicates to get a flac id and the flac file
// look in tags to get tags for the flac id
// look in metadata to find applicable scores


// 0 check if db has changed

// ???

// 1 get panels

$panels = array();
$sql = "SELECT page_num, page_id FROM score_pages WHERE page_scorecode='metaphysics'";
//$sql = "SELECT id, firstname, lastname FROM MyGuests WHERE lastname='Doe'";
    //echo "$sql\n";
    
    
if($stmt = $pdo->prepare($sql)){        
    // Attempt to execute the prepared statement
    if($stmt->execute()){
        if($stmt->rowCount() >= 1){
                while($row = $stmt->fetch()){
                $panels[] = [$row["page_num"], $row["page_id"]];
            }
        }
    }
    unset($stmt);
}

// the panels also get a json file
$json_panels = json_encode($panels);
$handle = fopen("../json/panels.json", "w");
fwrite($handle, $json_panels);
fclose($handle);


foreach ($panels as $panel) {

    $pagenum = $panel[0];
    $pageid = $panel[1];

    // each panel gets a file
    $json_contents = array();


    // 2 get all the accepted audio
    $accepted = array();

    $sql = "SELECT id, sa_x, sa_y FROM submitted_audio  WHERE sa_pageid = :sa_pageid AND sa_accepted = 1 ORDER By sa_x";
    //echo "$sql\n";
    
    
    if($stmt = $pdo->prepare($sql)){ 
        $stmt->bindParam(":sa_pageid", $param_pageid, PDO::PARAM_STR);

        $param_pageid = $pageid;
        // Attempt to execute the prepared statement
        if($stmt->execute()){
            if($stmt->rowCount() >= 1){
                while($row = $stmt->fetch()){
                    $accepted[] = [$row["id"], $row["sa_x"], $row["sa_y"]];
                }
            }
        }
        unset($stmt);   
    }


    foreach ($accepted as $location){
        $id = $location[0];
        $x = $location[1];
        $y = $location[2];

        $versions = get_editted($id, $pdo);

        foreach ($versions as $ver){
            $e_id = $ver[0]; 
            $wav = $ver[1]; 
            $flac = $ver[2];
    
            $tags = get_tags($e_id, $pdo);

            // metadata is not yet online
            $meta = array();

            $json_contents[] = [$x, $y, $wav, $flac, $meta, $tags];
        }
    }


    //export a json file
    $json_encoded = json_encode($json_contents);
    $handle = fopen("../json/$pageid.json", "w");
    fwrite($handle, $json_encoded);
    fclose($handle);

}

?>

