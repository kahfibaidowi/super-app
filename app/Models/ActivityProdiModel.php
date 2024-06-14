<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityProdiModel extends Model
{
    use HasFactory;

    protected $table="tbl_activity_prodi";
    protected $primaryKey="id_activity_prodi";

    protected $fillable = [
        'file_tor_rab',
        'file_tor',
        'file_rab',
        'iku',
        'ik',
        'program',
        'judul_kegiatan',
        'penanggung_jawab_kegiatan',
        'data'
    ];
    protected $perPage=99999999999999999999;

    protected $casts = [
        'data' => 'array',
    ];
}
