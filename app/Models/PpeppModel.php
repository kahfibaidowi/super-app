<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PpeppModel extends Model
{
    use HasFactory;

    protected $table="tbl_ppepp";
    protected $primaryKey="id_ppepp";

    protected $fillable = [
        'id_kriteria',
        'nested',
        'nama_ppepp',
        'deskripsi',
        'standar_minimum',
        'bobot',
        'skor'
    ];
    protected $perPage=99999999999999999999;

    protected $casts = [
    ];

    
    //relationship
    public function parent(){
        return $this->belongsTo(PpeppModel::class, "nested", "id_ppepp");
    }
    public function sub_ppepp(){
        return $this->hasMany(PpeppModel::class, "nested", "id_ppepp");
    }
    public function kriteria(){
        return $this->belongsTo(PpeppKriteriaModel::class, "id_kriteria", "id_kriteria");
    }
    public function bukti(){
        return $this->hasMany(BuktiModel::class, "id_ppepp", "id_ppepp");
    }
}
