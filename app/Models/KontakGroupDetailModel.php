<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KontakGroupDetailModel extends Model
{
    use HasFactory;

    protected $table="tbl_kontak_group_detail";
    protected $primaryKey="id_detail";

    protected $fillable = [
        'id_kontak',
        'id_group'
    ];
    protected $perPage=99999999999999999999;

    protected $casts = [
    ];

    
    //relationship
    public function kontak(){
        return $this->belongsTo(KontakModel::class, "id_kontak", "id_kontak");
    }
}
