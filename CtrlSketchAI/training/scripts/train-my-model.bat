
@echo off
REM Windows batch file to start LoRA training using Axolotl

echo Starting CtrlSketch LoRA fine-tuning...
cd /d %~dp0
cd ..
call conda activate axolotl
python -m axolotl.cli.train config/axolotl.yaml
pause
