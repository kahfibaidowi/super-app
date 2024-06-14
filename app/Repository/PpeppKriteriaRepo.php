<?php

namespace App\Repository;

use App\Models\PpeppKriteriaModel;

class PpeppKriteriaRepo{

    public static function gets($params)
    {
        $params['per_page']=isset($params['per_page'])?trim($params['per_page']):"";
        $params['q']=isset($params['q'])?$params['q']:"";

        //query
        $query=PpeppKriteriaModel::query();
        $query=$query->where("nama_kriteria", "like", "%".$params['q']."%");

        $query=$query->orderByDesc("id_kriteria");

        //return
        return $query->paginate($params['per_page'])->toArray();
    }
}