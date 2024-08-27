<?php

namespace App\Repository;

use App\Models\BuktiModel;
use App\Models\PpeppKriteriaModel;

class BuktiRepo{

    public static function gets($params)
    {
        $params['per_page']=isset($params['per_page'])?trim($params['per_page']):"";
        $params['q']=isset($params['q'])?$params['q']:"";
        $params['id_ppepp']=isset($params['id_ppepp'])?trim($params['id_ppepp']):"";
        $params['id_sub_ppepp']=isset($params['id_sub_ppepp'])?trim($params['id_sub_ppepp']):"";
        $params['id_kriteria']=isset($params['id_kriteria'])?trim($params['id_kriteria']):"";

        //query
        $query=BuktiModel::with(
            "sub_ppepp:id_ppepp,nested,nama_ppepp,skor",
            "sub_ppepp.parent:id_ppepp,nested,nama_ppepp,deskripsi,id_kriteria"
        );
        $query=$query->where("deskripsi", "like", "%".$params['q']."%");
        //--id_ppepp
        if($params['id_ppepp']!=""){
            $query=$query->whereHas("sub_ppepp", function($q)use($params){
                $q->where("nested", $params['id_ppepp']);
            });
        }
        //--id_sub_ppepp
        if($params['id_sub_ppepp']!=""){
            $query=$query->whereHas("sub_ppepp", function($q)use($params){
                $q->where("id_ppepp", $params['id_sub_ppepp']);
            });
        }
        //--id_kriteria
        if($params['id_kriteria']!=""){
            $query=$query->whereHas("sub_ppepp.parent", function($q)use($params){
                $q->where("id_kriteria", $params['id_kriteria']);
            });
        }

        $query=$query->orderByDesc("id_bukti");

        //return
        return $query->paginate($params['per_page'])->toArray();
    }

    public static function gets_rekap()
    {
        //query
        $query=PpeppKriteriaModel::with("ppepp", "ppepp.sub_ppepp", "ppepp.sub_ppepp.bukti");

        //return
        return $query->get()->toArray();
    }
}