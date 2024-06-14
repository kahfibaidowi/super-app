<?php

namespace App\Repository;

use App\Models\PpeppModel;

class PpeppRepo{

    public static function gets($params)
    {
        $params['per_page']=isset($params['per_page'])?trim($params['per_page']):"";
        $params['q']=isset($params['q'])?$params['q']:"";
        $params['type']=isset($params['type'])?trim($params['type']):"";
        $params['nested']=isset($params['nested'])?trim($params['nested']):"";
        $params['id_kriteria']=isset($params['id_kriteria'])?trim($params['id_kriteria']):"";

        //query
        $query=PpeppModel::query();
        $query=$query->where(function($q)use($params){
            $q->where("nama_ppepp", "like", "%".$params['q']."%")
                ->orWhere("deskripsi", "like", "%".$params['q']."%");
        });
        //--type(ppepp, sub ppepp)
        if($params['type']=="ppepp"){
            $query=$query->whereNull("nested");
        }
        elseif($params['type']=="sub_ppepp"){
            $query=$query->whereNotNull("nested");
        }
        //--nested
        if($params['nested']!=""){
            $query=$query->where("nested", $params['nested']);
        }
        //--id_kriteria
        if($params['id_kriteria']!=""){
            $query=$query->where("id_kriteria", $params['id_kriteria']);
        }

        $query=$query->orderByDesc("id_ppepp");

        //return
        return $query->paginate($params['per_page'])->toArray();
    }
}