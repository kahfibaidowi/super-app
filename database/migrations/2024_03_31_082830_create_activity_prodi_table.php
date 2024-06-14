<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tbl_activity_prodi', function (Blueprint $table) {
            $table->id("id_activity_prodi");
            $table->text("file_tor_rab");
            $table->text("file_tor");
            $table->text('file_rab');
            $table->text("iku");
            $table->text("ik");
            $table->text("program");
            $table->text("judul_kegiatan");
            $table->text("penanggung_jawab_kegiatan");
            $table->mediumText("data");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_activity_prodi');
    }
};
