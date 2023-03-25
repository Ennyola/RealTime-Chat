# Generated by Django 4.0.1 on 2023-02-08 13:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('find_friends', '0003_remove_friendrequest_message_block'),
    ]

    operations = [
        migrations.AlterField(
            model_name='friendship',
            name='status',
            field=models.CharField(choices=[('ACC', 'Accepted'), ('REJ', 'Rejected'), ('PND', 'Pending'), ('CNC', 'Cancelled')], max_length=10),
        ),
    ]