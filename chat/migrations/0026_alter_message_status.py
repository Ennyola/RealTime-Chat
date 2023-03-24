# Generated by Django 4.0.1 on 2023-03-22 11:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0025_alter_message_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='status',
            field=models.CharField(blank=True, choices=[('delivered', 'Delivered'), ('read', 'Read')], default='delivered', max_length=20, null=True),
        ),
    ]
