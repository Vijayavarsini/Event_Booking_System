from setuptools import setup, find_packages

setup(
    name="event-sdk",
    version="1.0.0",
    description="Python SDK for Event Booking System (generated via OpenAPI Generator CLI)",
    packages=find_packages(),
    install_requires=["requests>=2.28.0"],
    python_requires=">=3.8",
)
