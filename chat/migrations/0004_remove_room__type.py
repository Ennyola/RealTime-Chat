# Generated by Django 4.0.1 on 2022-01-22 19:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0003_rename_message_message_content_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='room',
            name='_type',
        ),
    ]
