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
        Schema::create('tbl_pesan_whatsapp', function (Blueprint $table) {
            $table->id("id_pesan_whatsapp");
            $table->mediumText("penerima");
            $table->mediumText("pesan");
            $table->mediumText("file");
            $table->text("status");
            $table->dateTime("jadwal_kirim")->nullable();
            $table->mediumText("data");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_pesan_whatsapp');
    }
};
