# Generated by Django 4.0.1 on 2023-02-17 20:24

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('find_friends', '0004_alter_friendship_status'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='friendrequest',
            options={'ordering': ['-created_at']},
        ),
    ]
