from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="universal-tts",
    version="1.0.0",
    author="Universal TTS Open Source Community",
    author_email="maintainers@universal-tts.org",
    description="Universal 7000+ Language Text-to-Speech Engine with Flow Matching and Voice Cloning",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/universal-tts/universal-tts",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: Apache Software License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Multimedia :: Sound/Audio :: Speech",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
    ],
    python_requires=">=3.11",
    install_requires=[
        "torch>=2.3.0",
        "torchaudio>=2.3.0",
        "transformers>=4.40.0",
        "soundfile>=0.12.1",
        "librosa>=0.10.1",
        "numpy>=1.26.0",
        "pydantic>=2.7.0",
        "fastapi>=0.111.0",
        "pyyaml>=6.0.1",
    ],
    entry_points={
        "console_scripts": [
            "universal-tts=src.api.server:main",
        ],
    },
)
