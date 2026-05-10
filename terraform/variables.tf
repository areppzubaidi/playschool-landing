variable "aws_region" { default = "ap-southeast-1" }
variable "project" { default = "playschool" }
variable "instance_type" { default = "t3.micro" } # Free tier eligible
variable "key_name" { description = "EC2 keypair name (create in AWS console)" }
variable "min_size" { default = 1 }
variable "max_size" { default = 3 }
variable "desired" { default = 2 }
