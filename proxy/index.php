<?php
    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => $_GET['get']
    ));
    curl_exec($curl);
?>