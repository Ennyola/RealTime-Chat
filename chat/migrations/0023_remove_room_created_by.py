# Generated by Django 4.0.1 on 2023-02-23 14:56

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0022_room_created_by'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='room',
            name='created_by',
        ),
    ]
