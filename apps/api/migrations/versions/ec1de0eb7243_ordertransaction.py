"""ordertransaction

Revision ID: ec1de0eb7243
Revises: bf2594e4344b
Create Date: 2025-07-23 00:50:27.665715

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'ec1de0eb7243'
down_revision: Union[str, None] = 'bf2594e4344b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    
    op.execute("DROP TYPE IF EXISTS paymentmethodenum")
    op.execute("DROP TYPE IF EXISTS ordertransactionstatusenum")

    
    # Create table
    op.create_table('order_transactions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('order_id', sa.UUID(), nullable=False),
        sa.Column('transaction_id', sa.String(), nullable=False),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('currency', sa.String(), nullable=False),
        sa.Column('payment_method', sa.Enum('CASH', 'ESEWA', 'KHALTI', 'STRIPE', name='paymentmethodenum'), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'SUCCESS', 'FAILED', name='ordertransactionstatusenum'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('order_id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('order_transactions')
    # Note: Not dropping enums as they might be used by other tables