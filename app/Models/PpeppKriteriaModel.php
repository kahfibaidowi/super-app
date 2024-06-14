<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PpeppKriteriaModel extends Model
{
    use HasFactory;

    protected $table="tbl_ppepp_kriteria";
    protected $primaryKey="id_kriteria";

    protected $fillable = [
        'nama_kriteria'
    ];
    protected $perPage=99999999999999999999;

    protected $casts = [
    ];
}
