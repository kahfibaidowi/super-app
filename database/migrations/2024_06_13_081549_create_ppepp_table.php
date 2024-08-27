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
        Schema::create('tbl_ppepp', function (Blueprint $table) {
            $table->id("id_ppepp");
            $table->unsignedBigInteger("id_kriteria")->nullable();
            $table->unsignedBigInteger("nested")->nullable();
            $table->text("nama_ppepp");
            $table->text("deskripsi");
            $table->text("standar_minimum");
            $table->double("bobot")->nullable();
            $table->double("skor")->nullable();
            $table->timestamps();

            //fk
            $table->foreign("id_kriteria")->references("id_kriteria")->on("tbl_ppepp_kriteria")->onDelete("cascade");
            $table->foreign("nested")->references("id_ppepp")->on("tbl_ppepp")->onDelete("cascade");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_ppepp');
    }
};
