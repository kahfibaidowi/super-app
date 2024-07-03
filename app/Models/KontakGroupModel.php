<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KontakGroupModel extends Model
{
    use HasFactory;

    protected $table="tbl_kontak_group";
    protected $primaryKey="id_group";

    protected $fillable = [
        'nama_group'
    ];
    protected $perPage=99999999999999999999;

    protected $casts = [
    ];

    
    //relationship
    public function kontak(){
        return $this->belongsToMany(
            KontakModel::class, 
            KontakGroupDetailModel::class, 
            "id_group", 
            "id_kontak", 
            "id_group", 
            "id_kontak"
        );
    }
}
