<?php

namespace App\Repository;

use App\Models\LakinModel;

class LakinRepo{

    public static function get_by_type($type)
    {

        //query
        $query=LakinModel::where("type", $type);

        //return
        if(is_null($query->first())) return null;
        return $query->first()['content'];
    }
}