# Generated by Django 4.0.1 on 2023-02-22 18:07

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0020_alter_room_created_by'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='room',
            name='created_by',
        ),
    ]
