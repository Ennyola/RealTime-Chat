# Generated by Django 4.0.1 on 2023-02-22 17:57

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('chat', '0019_alter_room_room_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='room',
            name='created_by',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='created_room', to=settings.AUTH_USER_MODEL),
        ),
    ]